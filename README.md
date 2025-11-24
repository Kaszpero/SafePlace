# SafePlace - Aplikacja do zgłaszania zagrożeń

Aplikacja webowa umożliwiająca zgłaszanie i monitorowanie zagrożeń w okolicy z systemem społecznej weryfikacji.

# JESLI JAKIMS CUDEM NIC NIE BEDZIE DZIALAC LUB JESLI NIE MA CZASU NA INSTALOWANIE NODE.JS TO PROSZE UZYC PLIKU SafePlace(PLAN B).html

## 🚀 Funkcjonalności

- **Mapa interaktywna** z geolokalizacją
- **System zgłaszania zagrożeń** (10 poziomów zagrożenia)
- **Społeczna weryfikacja** - użytkownicy głosują czy problem został rozwiązany
- **Filtrowanie i wyszukiwanie** zgłoszeń
- **Statystyki w czasie rzeczywistym**
- **Responsywny design** z animacjami

## 📦 Instalacja

1. Pobierz i zainstaluj Node.js
2. Rozpakuj pliki aplikacji
3. Otwórz terminal w folderze aplikacji
4. Uruchom komendę: `npm install`
5. Uruchom serwer: `npm start`
6. Otwórz przeglądarkę: `http://localhost:3000`

## 📁 Struktura projektu
DODAJ TE FOLDERY I WLORZ TAM RZECZY
- **safeplace-app/**
- **│**
- **├── package.json # Konfiguracja projektu**
- **├── server.js # Serwer Express**
- **│**
- **├── public/ # Frontend**
- **│ ├── index.html # Główny plik HTML**
- **│ ├── css/**
- **│ │ └── style.css # Style aplikacji**
- **│ ├── js/**
- **│ │ ├── app.js # Główna logika**
- **│ │ ├── map.js # Mapa Leaflet**
- **│ │ └── threats.js # Zarządzanie zagrożeniami**
- **│ └── data/ # DANE (tworzy się automatycznie)**
- **│ └── threats.json # Zgłoszenia (tworzy się automatycznie)**
- **│**
- **└── README.md # Ten plik**

## 🎮 Jak używać

1. **Kliknij na mapę** w miejscu zagrożenia
2. **Wypełnij formularz** (rodzaj, poziom, opis)
3. **Głosuj na zgłoszenia** innych użytkowników
4. **Używaj filtrów** do przeglądania zgłoszeń

## 🗳️ System głosowania

- Każdy użytkownik może zagłosować **raz na zgłoszenie**
- **Przycisk "Rozwiązane"** 👍 - problem został naprawiony
- **Przycisk "Nierozwiązane"** 👎 - problem nadal istnieje
- **Procentowe wskazanie** pokazuje opinię społeczności
- **Filtry statusu** pozwalają przeglądać zgłoszenia według wyników głosowania

## 🎨 Animacje

Aplikacja zawiera płynne animacje:
- Pojawianie się elementów
- Przejścia między stanami
- Efekty hover
- Animowane przyciski
- Płynne przejścia mapy

## 🔧 Technologie

- **Frontend:** HTML5, CSS3, JavaScript, Leaflet.js
- **Backend:** Node.js, Express.js
- **Mapy:** OpenStreetMap
- **Styl:** CSS Grid, Flexbox, Animacje CSS

## UWAGA
-Problem: Brak folderu data i tego jednego Jsona

- **NIE TWÓRZ GO! Serwer tworzy go automatycznie przy pierwszym uruchomieniu.**
- **Przepraszam ale jesli bedzie uzwany plik "SAFEPLACE(PLAN B)" to przepraszam za lekkie bledy itp.**

