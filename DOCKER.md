# Docker Compose Development

Chạy toàn bộ source với hot reload:

```bash
cd CNPM-Nhom21
docker compose up --build
```

Mở frontend:

```txt
http://localhost:5173
```

Backend API:

```txt
http://localhost:5000/api/v1
```

Seed tài khoản mẫu:

```bash
docker compose --profile seed run --rm seed-admin
```

Tài khoản:

```txt
admin / 123456
gv001 / 123456
```

Dừng container:

```bash
docker compose down
```

Xóa luôn database và node_modules volumes:

```bash
docker compose down -v
```

Source code được mount trực tiếp:

- `./backend:/app`
- `./frontend:/app`

Vì vậy khi sửa file backend/frontend trên máy thật, container sẽ tự nhận thay đổi qua `node --watch` và Vite dev server.
