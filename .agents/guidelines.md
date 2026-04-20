# Zpotify Project Guidelines

This document provides architectural and technical guidelines for Zpotify project, 
intended for AI agents and developers.

## 🏗 Architectural Overview

The project follows a **Clean Architecture** (ports & adapters) pattern.
Data flows: **Transport -> Service -> Storage**.

### 1. Transport Layer (`internal/transport/`)
- Handles external communication (gRPC, HTTP, Telegram).
- Responsible for request/response mapping between external protocols (e.g., Protobuf) and `internal/domain`.
- No business logic should reside here.
- Example: `internal/transport/playlist_api_impl/list_songs.go`.
- Each handle should be in separate file

### 2. Service Layer (`internal/service/`)
- Contains core business logic.
- Depends on `internal/storage` interfaces.
- Uses `internal/domain` entities.
- Error handling with `go.redsock.ru/rerrors`.
- Example: `internal/service/v1/playlist_service.go`.

### 3. Storage Layer (`internal/storage/`)
- Persistent data access (PostgreSQL).
- Uses `github.com/Masterminds/squirrel` for dynamic SQL building.
- Uses `sqlc` for generated queries where appropriate.
- Implementation located in `internal/storage/pg/`.

### 4. Domain Layer (`internal/domain/`)
- Contains core data structures and interfaces shared across the application.
- Example: `internal/domain/playlist.go`.

## 🛠 Tech Stack & Tools

- **Language:** Go 1.24 (Always use modern Go idioms: `slices.Collect`, `any`, `err == target` -> `errors.Is`).
- **API:** Protobuf/gRPC (defined in `api/grpc/`).
- **Database:** PostgreSQL.
- **Migration:** SQL files in `migrations/`.
- **Codegen:**
  - `protopack` for Protobuf generation.
  - `sqlc` for SQL query generation.
  - `rscli.mk` (via `Makefile`) for standard tasks.
  - `rscli-dev project tidy` - a custom cli utility for projects
  - `moti g` for protoc generation

## 📝 Code Style & Patterns

### Error Handling
- Use `go.redsock.ru/rerrors` for wrapping errors with context.
- Format: `rerrors.Wrap(err, "contextual message")`.

### Naming Conventions
- Go standard naming (camelCase for internal, PascalCase for exported).
- Interfaces should be in `internal/storage/storage.go` and `internal/service/service.go`.

### Pointers and Nil Checks
- Use `go.redsock.ru/toolbox.ToPtr` for converting values to pointers if needed in requests.

### Go Style Preferences
- **No in-place function calls with error checks:** Avoid `if err := someFunc(); err != nil`. Instead, call the function first: `err := someFunc(); if err != nil`.
- **No in-place struct/variable creation in function calls:** Avoid passing complex literals directly to functions. Create the variable first, then pass it: `req := domain.Request{...}; res, err := service.Call(req)`.

### Database Patterns
- Use `squirrel` (aliased as `sq`) for building complex queries.
- SQL placeholders: `sq.Dollar`.
- For most of the time `sqlc` is a prefered way. 
- For complex select queries it is recommended to create a view (with a version) and use squirrel over the view   

## ⚙️ Development Workflow

- Run `make codegen` after changing `.proto` or `sqlc.yaml`.
- Run `make sqlc` to generate SQL queriers.
- Migrations are found in `migrations/` and follow a timestamped naming convention.

## 📂 Directory Structure

- `api/grpc/`: Protobuf definitions.
- `cmd/service/`: Application entry point.
- `internal/app/`: Application initialization and dependency injection.
- `internal/transport/`: protocol adapters.
- `internal/service/`: Business logic.
- `internal/storage/`: Data persistence.
- `pkg/web/`: Frontend and UI-related code.
- `examples/`: `.http` files for manual API testing.


## Examples folder
Contains all api calls examples. 