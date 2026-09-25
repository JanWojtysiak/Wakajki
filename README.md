# Wakajki

Wakajki to open source’owy projekt na wakacyjne wyzwanie koła naukowego [Solvro](https://solvro.pwr.edu.pl). Ma w przyszłości ułatwić uczestnikom tego wyzwania szukanie się do projektów, które będą razem tworzyć.

To jeszcze wersja alpha. Wymaga poprawek (ktore zostana niedlugo dodane), ale pokazuje z grubsza, jak aplikacja będzie wyglądać.

## Co robi

Po zalogowaniu przez Discord użytkownik widzi listę projektów i może:

- założyć projekt — z nazwą, opisem i liczbą potrzebnych osób,
- oznaczyć go jako otwarty (każdy może dołączyć) albo zamknięty (trzeba wysłać prośbę),
- dołączyć do otwartego projektu albo wysłać prośbę o dołączenie do zamkniętego,
- jako właściciel zaakceptować albo odrzucić prośby,
- edytować i usuwać własne projekty oraz wychodzić z tych, do których się dołączyło.

## Uruchomienie

Potrzebujesz Dockera i pliku `.env` (wzorzec jest w `.env.example`). Do logowania uzupełnij dane aplikacji Discord:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_CALLBACK_URL` — domyślnie `http://localhost:3000/auth/discord/callback`

Potem:

```bash
docker compose up --build
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3000](http://localhost:3000)
- Dokumentacja API: [http://localhost:3000/api](http://localhost:3000/api)

## Stack

NestJS, React (Vite), Prisma, PostgreSQL i logowanie przez Discord.
