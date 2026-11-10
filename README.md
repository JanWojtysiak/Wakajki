<a id="polski"></a>

🇵🇱 [Polski](#polski) | 🇬🇧 [English](#english)

# 🤝 Wakajki

![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

> 🎓 Projekt open source tworzony z myślą o Wakacyjnym Wyzwaniu koła naukowego [KN Solvro](https://solvro.pwr.edu.pl) (Politechnika Wrocławska).

Wakajki to aplikacja webowa, dzięki której uczestnicy Wakacyjnego Wyzwania mogą łatwiej skompletować zespół do wspólnego projektu. Po zalogowaniu przez Discorda można dodać własny projekt albo dołączyć do projektu kogoś innego.

> Aplikacja jest w fazie alpha.

## ✨ Funkcje

- Logowanie przez Discord OAuth
- Tworzenie projektów z nazwą, opisem i liczbą potrzebnych osób
- Projekty otwarte (dołączasz od razu) i zamknięte (wysyłasz prośbę, a właściciel ją akceptuje lub odrzuca)
- Edycja i usuwanie własnych projektów oraz opuszczanie projektów, do których się dołączyło
- Wyrzucanie osób z projektu przez właściciela
- Powiadomienia na stronie
- Lista projektów odświeżana na bieżąco
- Jasny i ciemny motyw oraz widok na telefony

## 🙋 Mój wkład

- **Setup projektu** — postawienie projektu od zera i późniejsze uporządkowanie struktury repozytorium na `backend/` i `frontend/`
- **Nowy interfejs** — przebudowa UI dashboardu z komponentami shadcn/ui, podział na osobne komponenty (panel boczny, lista projektów, powiadomienia)
- **Responsywność i motywy** — widok dostosowany do telefonów oraz przełącznik jasnego i ciemnego motywu
- **Powiadomienia** — panel powiadomień na stronie, m.in. o prośbach o dołączenie do projektu
- **Prośby o dołączenie** — obsługa projektów zamkniętych: wysyłanie próśb oraz akceptowanie i odrzucanie ich przez właściciela
- **Wyrzucanie osób z projektu** — właściciel może usunąć uczestnika ze swojego projektu
- **CRUD** — endpointy do tworzenia, odczytu, edycji i usuwania projektów; filtrowanie listy projektów przeniesione z frontendu na backend
- **Baza danych** — zaprojektowanie schematu w Prisma, migracje i podłączenie PostgreSQL do backendu
- **Sesje i logowanie** — sesje oparte na ciasteczkach oraz walidacja konfiguracji Discord OAuth
- **Konteneryzacja** — konfiguracja Dockera i Docker Compose (backend, frontend i PostgreSQL uruchamiane jednym poleceniem) z wygodnym środowiskiem deweloperskim
- **Poprawki błędów** — m.in. odświeżanie listy projektów, usuwanie projektów przez właściciela i logo w panelu bocznym

## 🛠️ Technologie

| Część          | Technologie                                                               |
| -------------- | ------------------------------------------------------------------------- |
| Backend        | NestJS, TypeScript, Prisma, PostgreSQL, Passport (Discord OAuth), Swagger |
| Frontend       | React, Vite, TypeScript, Tailwind CSS                                     |
| Infrastruktura | Docker, Docker Compose                                                    |

## 🚀 Jak uruchomić

1. Skopiuj `.env.example` do `.env`.
2. Uzupełnij dane aplikacji Discord: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` i `DISCORD_CALLBACK_URL` (domyślnie `http://localhost:3000/auth/discord/callback`).
3. Uruchom:

```bash
docker compose up --build
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3000](http://localhost:3000)
- Dokumentacja API (Swagger): [http://localhost:3000/api](http://localhost:3000/api)

## 📁 Struktura

- `backend/` — API w NestJS (kod w `src/`, schemat bazy w `prisma/`, migracje w `migrations/`)
- `frontend/` — aplikacja React (Vite)

---

<a id="english"></a>

🇵🇱 [Polski](#polski) | 🇬🇧 [English](#english)

# 🤝 Wakajki

> 🎓 An open source project built for the Summer Challenge of the [KN Solvro](https://solvro.pwr.edu.pl) student research group (Wrocław University of Science and Technology).

Wakajki is a web app that helps Summer Challenge participants put together a team for a shared project. After signing in with Discord, you can post your own project or join someone else's.

> The app is in alpha.

## ✨ Features

- Sign-in with Discord OAuth
- Creating projects with a name, description and number of people needed
- Open projects (join right away) and closed projects (send a request that the owner accepts or rejects)
- Editing and deleting your own projects, and leaving projects you have joined
- Owners can remove members from their project
- In-app notifications
- Project list that stays up to date
- Light and dark theme, mobile-friendly layout

## 🙋 My contribution

- **Project setup** — bootstrapped the project from scratch and later reorganized the repository into `backend/` and `frontend/`
- **New interface** — redesigned the dashboard UI with shadcn/ui components and split it into separate components (sidebar, project list, notifications)
- **Responsiveness and themes** — mobile-friendly layout and a light/dark theme toggle
- **Notifications** — an in-app notifications panel, including alerts about requests to join a project
- **Join requests** — support for closed projects: sending requests, and accepting or rejecting them as the owner
- **Removing members** — project owners can remove participants from their project
- **CRUD** — endpoints for creating, reading, updating and deleting projects; moved project list filtering from the frontend to the backend
- **Database** — designed the schema with Prisma, wrote migrations and connected PostgreSQL to the backend
- **Sessions and sign-in** — cookie-based sessions and validation of the Discord OAuth configuration
- **Containerization** — set up Docker and Docker Compose (backend, frontend and PostgreSQL start with a single command) with a convenient dev setup
- **Bug fixes** — including project list refreshing, owners deleting projects and the sidebar logo

## 🛠️ Tech stack

| Part           | Technologies                                                              |
| -------------- | ------------------------------------------------------------------------- |
| Backend        | NestJS, TypeScript, Prisma, PostgreSQL, Passport (Discord OAuth), Swagger |
| Frontend       | React, Vite, TypeScript, Tailwind CSS                                     |
| Infrastructure | Docker, Docker Compose                                                    |

## 🚀 Getting started

1. Copy `.env.example` to `.env`.
2. Fill in your Discord app credentials: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` and `DISCORD_CALLBACK_URL` (defaults to `http://localhost:3000/auth/discord/callback`).
3. Run:

```bash
docker compose up --build
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3000](http://localhost:3000)
- API docs (Swagger): [http://localhost:3000/api](http://localhost:3000/api)

## 📁 Project structure

- `backend/` — NestJS API (code in `src/`, database schema in `prisma/`, migrations in `migrations/`)
- `frontend/` — React app (Vite)
