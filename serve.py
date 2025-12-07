import argparse
import functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


def parse_args():
  parser = argparse.ArgumentParser(
    description="HexaFractal の静的ファイルをローカルで配信する簡易サーバー",
  )
  parser.add_argument("--port", type=int, default=8000, help="待ち受けポート番号 (デフォルト: 8000)")
  parser.add_argument(
    "--bind",
    default="0.0.0.0",
    help="バインドするホスト。外部からアクセスしない場合は 127.0.0.1 を指定してください。",
  )
  return parser.parse_args()


def main():
  args = parse_args()
  root = Path(__file__).resolve().parent

  handler = functools.partial(SimpleHTTPRequestHandler, directory=root)
  server = ThreadingHTTPServer((args.bind, args.port), handler)

  print(f"Serving {root} on http://{args.bind}:{args.port} (Press CTRL+C to quit)")
  try:
    server.serve_forever()
  except KeyboardInterrupt:
    print("\nStopping server...")
  finally:
    server.server_close()


if __name__ == "__main__":
  main()
