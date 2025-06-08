# System Rezerwacji - Booking Calendar Harmony

Aplikacja do zarządzania rezerwacjami z intuicyjnym interfejsem kalendarza.

## 🚀 Funkcjonalności

- **Kalendarz rezerwacji** - widoki miesięczny, tygodniowy i dzienny
- **Zarządzanie rezerwacjami** - tworzenie, edycja, usuwanie i filtrowanie
- **System statusów** - oczekująca, potwierdzona, zakończona, anulowana
- **Responsywny design** - działa na wszystkich urządzeniach
- **Autentykacja** - bezpieczne logowanie przez Supabase Auth
- **Real-time updates** - automatyczne odświeżanie danych

## 🛠️ Technologie

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: TanStack Query (React Query)
- **Date Handling**: date-fns
- **Icons**: Lucide React

## 📦 Instalacja

```bash
# Sklonuj repozytorium
git clone https://github.com/norbertturek/booking-calendar-harmony.git

# Przejdź do katalogu projektu
cd booking-calendar-harmony

# Zainstaluj zależności
yarn install

# Uruchom serwer deweloperski
yarn dev
```

## ⚙️ Konfiguracja

1. Utwórz projekt w [Supabase](https://supabase.com)
2. Skopiuj zmienne środowiskowe:

```bash
cp .env.example .env.local
```

3. Uzupełnij plik `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Uruchom migracje bazy danych w Supabase SQL Editor

## 🗄️ Struktura bazy danych

- `bookings` - główna tabela rezerwacji
- `time_slots` - dostępne sloty czasowe
- `business_hours` - godziny pracy
- `blocked_dates` - zablokowane daty

## 🎨 Komponenty

- `Calendar` - główny komponent kalendarza z trzema widokami
- `BookingsList` - lista i zarządzanie rezerwacjami
- `BookingModal` - formularz nowej rezerwacji
- `EditBookingModal` - edycja istniejących rezerwacji
- `AuthGuard` - ochrona tras wymagających logowania

## 📱 Widoki

### Kalendarz miesięczny
- Przegląd całego miesiąca
- Kolorowe wskaźniki statusów rezerwacji
- Szybki podgląd liczby rezerwacji na dzień

### Kalendarz tygodniowy
- Szczegółowy widok tygodnia
- Sloty godzinowe z rezerwacjami
- Łatwe dodawanie nowych rezerwacji

### Kalendarz dzienny
- Fokus na jeden dzień
- Wszystkie szczegóły rezerwacji
- Optymalne dla urządzeń mobilnych

## 🔧 Skrypty

```bash
# Rozwój
yarn dev

# Build produkcyjny
yarn build

# Podgląd buildu
yarn preview

# Linting
yarn lint

# Type checking
yarn type-check
```

## 🚀 Deployment

Aplikacja jest gotowa do wdrożenia na:

- **Vercel** (zalecane)
- **Netlify** 
- **Railway**
- **Render**

### Vercel Deployment

```bash
# Zainstaluj Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🤝 Rozwój

1. Fork repozytorium
2. Utwórz branch dla nowej funkcjonalności (`git checkout -b feature/amazing-feature`)
3. Commit zmian (`git commit -m 'Add amazing feature'`)
4. Push do brancha (`git push origin feature/amazing-feature`)
5. Otwórz Pull Request

## 📄 Licencja

Ten projekt jest licencjonowany na licencji MIT - zobacz plik [LICENSE](LICENSE) dla szczegółów.

## 👨‍💻 Autor

**Norbert Turek**
- GitHub: [@norbertturek](https://github.com/norbertturek)

## 🙏 Podziękowania

- [Supabase](https://supabase.com) za backend-as-a-service
- [shadcn/ui](https://ui.shadcn.com) za komponenty UI
- [Tailwind CSS](https://tailwindcss.com) za styling
- [Lucide](https://lucide.dev) za ikony
