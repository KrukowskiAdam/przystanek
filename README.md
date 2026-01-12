# Przystanek Alaska – mini VOD na Cloudflare

Poniżej znajdziesz krótką instrukcję konfiguracji Cloudflare (R2 + Pages) oraz sposób wprowadzenia własnych filmów do przygotowanej witryny.

## 1. Założenie konta Cloudflare
1. Wejdź na https://dash.cloudflare.com/sign-up i utwórz darmowe konto.
2. Potwierdź adres e-mail i zaloguj się do panelu.

## 2. Utworzenie zasobnika R2 i przesłanie filmów
1. W panelu wybierz **R2** → **Create bucket**.
2. Nadaj nazwę (np. `przystanek-alaska`) i wybierz region **Automatic**.
3. Po utworzeniu przejdź do zasobnika i w zakładce **Settings** włącz **Public Access** → **Bucket level public access**.
4. W sekcji **Objects** dodaj pliki `.mp4` oraz opcjonalne miniatury `.jpg`/`.png` (nazewnictwo dowolne).
5. Dla każdego przesłanego pliku skopiuj URL publiczny (przycisk **Public URL**). Adres będzie wyglądał jak:
   ```
   https://<accountid>.r2.cloudflarestorage.com/przystanek-alaska/odcinek-1.mp4
   ```

## 3. Aktualizacja listy filmów
1. W pliku `videos.json` zaktualizuj pola:
   - `title` – tytuł wyświetlany na liście,
   - `description` – krótki opis,
   - `duration` – czas trwania (dowolny tekst),
   - `src` – publiczny link z R2 do filmu,
   - `poster` – (opcjonalnie) miniatura filmu z R2,
   - `download` – (opcjonalnie) osobny link do pobrania; jeśli nie chcesz przycisku pobierania ustaw `"download": false`.
2. Dodaj/usuń wpisy tak, aby lista odpowiadała Twoim zasobom.

## 4. Publikacja w Cloudflare Pages
1. W panelu wybierz **Pages** → **Create a project**.
2. Opcja **Upload assets** pozwala wrzucić spakowany folder (`.zip`). Inaczej możesz podłączyć repozytorium Git (GitHub/GitLab).
3. Jeśli przesyłasz ręcznie:
   - Spakuj lokalny folder projektu.
   - Wybierz **Upload**, wskaż archiwum i zatwierdź wdrożenie.
4. Po wdrożeniu strona będzie dostępna pod adresem `https://<nazwa-projektu>.pages.dev`.

## 5. Aktualizacje
- Gdy dodajesz nowe filmy, aktualizuj `videos.json` i ponownie publikuj (lub skonfiguruj automatyczne wdrażanie z repozytorium).
- Możesz dołożyć prostą ochronę hasłem, korzystając z Cloudflare Access (darmowe 50 użytkowników), jeśli potrzebujesz prywatności.

## 6. Dalsze kroki
- Dodaj favicon (`favicon.ico`) i własne logo (np. w nagłówku).
- Przetestuj odtwarzanie na urządzeniach mobilnych; w razie potrzeby zmniejsz bitrate plików.
- Jeśli chcesz dodać napisy, umieść pliki `.vtt` w R2 i dołóż `<track>` w `index.html`.
