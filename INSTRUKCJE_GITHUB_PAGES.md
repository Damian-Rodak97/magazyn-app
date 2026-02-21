# Instrukcje wdrożenia aplikacji Magazyn na GitHub Pages

## Krok 1: Przygotowanie repozytorium GitHub

1. Zaloguj się na [GitHub.com](https://github.com)
2. Kliknij "+" w prawym górnym rogu → "New repository"
3. Podaj nazwę repozytorium: **`magazyn-app`**
4. Ustaw jako **Public** (wymagane dla darmowego GitHub Pages)
5. Kliknij "Create repository"

## Krok 2: Konfiguracja base URL

✅ **Już skonfigurowane!** 
Plik `index.html` jest już ustawiony na `<base href="/magazyn-app/" />`

## Krok 3: Wgranie plików

### Opcja A: Przez GitHub Desktop (łatwiejsza)
1. Pobierz [GitHub Desktop](https://desktop.github.com/)
2. Zaloguj się do swojego konta
3. File → Add Local Repository → wybierz `C:\Users\Damian\Desktop\Magazyn`
4. Publish repository
5. Skopiuj wszystkie pliki z `C:\Users\Damian\Desktop\Magazyn\publish\wwwroot\` do głównego folderu repo
6. Commit i Push

### Opcja B: Przez git w terminalu
```bash
cd C:\Users\Damian\Desktop\Magazyn
git init
git add publish/wwwroot/*
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TWOJA-NAZWA/magazyn-app.git
git push -u origin main
```
(Zamień "TWOJA-NAZWA" na swoją nazwę użytkownika GitHub)

### Opcja C: Przez interfejs webowy GitHub (najprostsza)
1. Wejdź do swojego repozytorium na GitHub
2. Kliknij "uploading an existing file"
3. Przeciągnij WSZYSTKIE pliki z folderu `C:\Users\Damian\Desktop\Magazyn\publish\wwwroot\`
4. Kliknij "Commit changes"

## Krok 4: Włączenie GitHub Pages

1. Wejdź do swojego repozytorium na GitHub
2. Kliknij "Settings" (na górze)
3. Znajdź "Pages" w menu po lewej
4. W sekcji "Source" wybierz:
   - Branch: **main**
   - Folder: **/ (root)**
5. Kliknij "Save"

## Krok 5: Czekaj i testuj

1. Po ~2-5 minutach aplikacja będzie dostępna pod adresem:
   - **`https://twoja-nazwa.github.io/magazyn-app/`**
   (Wpisz swoją nazwę użytkownika GitHub zamiast "twoja-nazwa")

2. Otwórz ten adres na telefonie i komputerze
3. Dodaj do ekranu głównego telefonu jako skrót PWA (opcjonalne)

## Aktualizacja aplikacji

Kiedy chcesz zaktualizować aplikację:
1. Zbuduj ponownie: `dotnet publish MagazynApp -c Release -o publish`
2. Skopiuj pliki z `publish\wwwroot\` do repozytorium
3. Commit i Push zmian

---

## Folder do wgrania

Wszystkie pliki są gotowe w folderze:
**`C:\Users\Damian\Desktop\Magazyn\publish\wwwroot\`**

Ten folder zawiera:
- ✅ index.html
- ✅ blazordb.js
- ✅ .nojekyll (wymaga GitHub Pages)
- ✅ _framework/ (kod Blazor)
- ✅ css/ (style)
- ✅ manifest.webmanifest (PWA)

## Wsparcie

Jeśli masz problemy:
1. Upewnij się, że plik .nojekyll jest w głównym folderze
2. Poczekaj 5-10 minut po pierwszym wdrożeniu
3. Sprawdź "Actions" w GitHub czy build się powiódł
4. Sprawdź czy nazwa repozytorium to dokładnie `magazyn-app` (bez spacji/znaków specjalnych)
