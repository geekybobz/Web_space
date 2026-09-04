#!/usr/bin/env python3

import argparse
import json
import socket
import threading
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PREVIEW_PATH = "/dist/index.html?localPreview=1"


class PreviewServerManager:
    def __init__(self, *, root: Path, host: str, port: int, wifi_host: str, wifi_port: int):
        self.root = root
        self.host = host
        self.port = port
        self.wifi_host = wifi_host
        self.wifi_port = wifi_port
        self.wifi_server: ThreadingHTTPServer | None = None
        self.wifi_thread: threading.Thread | None = None
        self.wifi_error: str | None = None
        self.lock = threading.Lock()

    def handler(self, bind_host: str, port: int):
        return partial(
            LocalPreviewHandler,
            directory=str(self.root),
            manager=self,
            bind_host=bind_host,
            port=port,
        )

    def status(self, bind_host: str, port: int) -> dict:
        lan_ip = _detect_lan_ip()
        lan_enabled = bind_host in {"0.0.0.0", "::"} or not bind_host.startswith("127.")
        lan_url = f"http://{lan_ip}:{port}{PREVIEW_PATH}" if lan_enabled and lan_ip else None
        wifi_running = self.wifi_server is not None
        wifi_url = f"http://{lan_ip}:{self.wifi_port}{PREVIEW_PATH}" if wifi_running and lan_ip else None
        return {
            "status": "running",
            "bindHost": bind_host,
            "port": port,
            "localUrl": f"http://localhost:{port}{PREVIEW_PATH}",
            "lanUrl": lan_url,
            "lanEnabled": lan_enabled,
            "wifiPreview": {
                "running": wifi_running,
                "host": self.wifi_host,
                "port": self.wifi_port,
                "url": wifi_url,
                "error": self.wifi_error,
            },
        }

    def start_wifi(self) -> dict:
        with self.lock:
            if self.wifi_server is not None:
                return self.status(self.host, self.port)
            try:
                server = ThreadingHTTPServer(
                    (self.wifi_host, self.wifi_port),
                    self.handler(self.wifi_host, self.wifi_port),
                )
            except OSError as exc:
                self.wifi_error = str(exc)
                return self.status(self.host, self.port)

            self.wifi_error = None
            self.wifi_server = server
            self.wifi_thread = threading.Thread(target=server.serve_forever, daemon=True)
            self.wifi_thread.start()
            print(f"Serving WiFi preview at http://{self.wifi_host}:{self.wifi_port}{PREVIEW_PATH}")
            return self.status(self.host, self.port)

    def stop_wifi(self) -> dict:
        with self.lock:
            server = self.wifi_server
            self.wifi_server = None
            self.wifi_thread = None
        if server is not None:
            server.shutdown()
            server.server_close()
        return self.status(self.host, self.port)

    def shutdown_all(self, server: ThreadingHTTPServer) -> None:
        self.stop_wifi()
        server.shutdown()


class LocalPreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory: str, manager: PreviewServerManager, bind_host: str, port: int, **kwargs):
        self.manager = manager
        self.bind_host = bind_host
        self.preview_port = port
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self) -> None:
        if self.path == "/__preview_status__":
            self._send_json(self._preview_status())
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path == "/__wifi_preview__":
            body_length = int(self.headers.get("Content-Length", "0") or "0")
            body = self.rfile.read(body_length) if body_length else b"{}"
            try:
                action = json.loads(body.decode("utf-8")).get("action", "start")
            except json.JSONDecodeError:
                action = "start"
            status = self.manager.stop_wifi() if action == "stop" else self.manager.start_wifi()
            self._send_json(status)
            return

        if self.path != "/__exit_preview__":
            self.send_error(HTTPStatus.NOT_FOUND, "Unknown endpoint")
            return

        self._send_json({"status": "shutting_down"})
        threading.Thread(target=self._shutdown_server, daemon=True).start()

    def _send_json(self, data: dict) -> None:
        payload = json.dumps(data).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)
        self.wfile.flush()

    def _preview_status(self) -> dict:
        return self.manager.status(self.bind_host, self.preview_port)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format: str, *args) -> None:
        super().log_message(format, *args)

    def _shutdown_server(self) -> None:
        self.manager.shutdown_all(self.server)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=2026)
    parser.add_argument("--wifi-host", default="0.0.0.0")
    parser.add_argument("--wifi-port", type=int, default=2032)
    return parser.parse_args()


def _detect_lan_ip() -> str | None:
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("8.8.8.8", 80))
        return sock.getsockname()[0]
    except OSError:
        try:
            return socket.gethostbyname(socket.gethostname())
        except OSError:
            return None
    finally:
        sock.close()


def main() -> None:
    args = parse_args()
    manager = PreviewServerManager(
        root=ROOT,
        host=args.host,
        port=args.port,
        wifi_host=args.wifi_host,
        wifi_port=args.wifi_port,
    )
    handler = manager.handler(args.host, args.port)
    server = ThreadingHTTPServer((args.host, args.port), handler)
    try:
        print(f"Serving local preview at http://{args.host}:{args.port}{PREVIEW_PATH}")
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        manager.stop_wifi()
        server.server_close()


if __name__ == "__main__":
    main()
