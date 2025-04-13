# HomeFinder App

## Your Interactive Guide to Singapore's Ideal Neighborhoods

![HomeFinder Logo](https://via.placeholder.com/150)

HomeFinder is a comprehensive web application designed to help prospective homebuyers in Singapore find their ideal neighborhood based on personalized preferences and real-time data. By centralizing crucial livability metrics and enabling side-by-side district comparisons, HomeFinder streamlines the home-hunting process that traditional property platforms have left fragmented.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [API Integrations](#api-integrations)
- [Assumptions](#assumptions)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Interactive District Map**: Visualize all 55 Singapore districts with customizable filters
- **Comprehensive Data Analysis**: Access real-time metrics on:
  - HDB resale prices
  - Crime rates
  - Proximity to schools
  - Shopping mall accessibility
  - Public transport availability (MRTs)
- **Side-by-Side Comparison**: Evaluate two districts simultaneously with detailed metrics
- **Personalized Recommendations**: Get "For You" suggestions based on your preferences
- **User Profiles**: Create an account to save preferences and favorite districts
- **Notification System**: Receive alerts when important metrics change in your favorite districts

## Demo

[Live Demo](https://homefinder-app.example.com)

![HomeFinder Screenshot](https://via.placeholder.com/800x400)

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Router v7 for navigation
- Vite for development and building
- Mapbox GL JS for geospatial rendering

### Backend
- Flask Python framework
- SQLite database
- RESTful API architecture

### Integrations
- data.gov.sg APIs (HDB resale prices, crime statistics, amenities data)
- Mapbox API for interactive mapping

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn
- pip

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/homefinder.git
cd homefinder
```

2. Set up the frontend
```bash
cd frontend
npm install
```

3. Set up the backend
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
pip install -r requirements.txt
```

4. Configure environment variables
```bash
# In the frontend directory
cp .env.example .env
# Edit .env with your Mapbox API key and backend URL

# In the backend directory
cp .env.example .env
# Edit .env with your database connection and API keys
```

5. Start the development servers
```bash
# Start backend (from backend directory)
flask run

# Start frontend (from frontend directory)
npm run dev
```

6. Access the application at `http://localhost:5173`

## Usage

1. **Create an account** or log in to save your preferences
2. **Set your priorities** by ranking importance of:
   - Resale price
   - Crime rate
   - Proximity to schools
   - Shopping accessibility
   - Public transport connectivity
3. **Explore the interactive map** using various filters
4. **Compare districts** side-by-side for detailed analysis
5. **Save favorite districts** for future reference
6. **Enable notifications** to stay updated on changes in your preferred areas

## API Integrations

HomeFinder leverages several data sources to provide comprehensive information:

- **data.gov.sg**: Real-time data on HDB resale prices, crime statistics, and amenities
- **Mapbox**: Interactive district visualization and geospatial rendering

## Assumptions

### Crime Rate Mapping

We've mapped Singapore's Neighbourhood Police Centres (NPCs) to the 55 URA planning areas to provide meaningful crime rate data. Each planning area is assigned to the most relevant or closest NPC, with some NPCs covering multiple planning areas.

| **Planning Area**       | **Mapped NPC**       |
| ----------------------- | -------------------- |
| Ang Mo Kio              | Ang Mo Kio South NPC |
| Bedok                   | Bedok NPC            |
| Bishan                  | Bishan NPC           |
| Boon Lay                | Jurong West NPC      |
| Bukit Batok             | Bukit Batok NPC      |
| Bukit Merah             | Bukit Merah West NPC |
| Bukit Panjang           | Bukit Panjang NPC    |
| Bukit Timah             | Bukit Timah NPC      |
| Central Water Catchment | Woodlands West NPC   |
| Changi                  | Changi NPC           |
| Choa Chu Kang           | Choa Chu Kang NPC    |
| Clementi                | Clementi NPC         |
| Downtown Core           | Marina Bay NPC       |
| Geylang                 | Geylang NPC          |
| Hougang                 | Hougang NPC          |
| Jurong East             | Jurong East NPC      |
| Jurong West             | Jurong West NPC      |
| Kallang                 | Kampong Java NPC     |
| Lim Chu Kang            | Nanyang NPC          |
| Mandai                  | Woodlands East NPC   |
| Marine Parade           | Marine Parade NPC    |
| Museum                  | Rochor NPC           |
| Newton                  | Orchard NPC          |
| Novena                  | Toa Payoh NPC        |
| Orchard                 | Orchard NPC          |
| Outram                  | Bukit Merah East NPC |
| Pasir Ris               | Pasir Ris NPC        |
| Paya Lebar              | Hougang NPC          |
| Pioneer                 | Nanyang NPC          |
| Punggol                 | Punggol NPC          |
| Queenstown              | Queenstown NPC       |
| River Valley            | Orchard NPC          |
| Rochor                  | Rochor NPC           |
| Seletar                 | Sengkang NPC         |
| Sembawang               | Sembawang NPC        |
| Sengkang                | Sengkang NPC         |
| Serangoon               | Serangoon NPC        |
| Simpang                 | Yishun North NPC     |
| Singapore River         | Marina Bay NPC       |
| Southern Islands        | Marina Bay NPC       |
| Sungei Kadut            | Woodlands West NPC   |
| Tampines                | Tampines NPC         |
| Tanglin                 | Bukit Timah NPC      |
| Tengah                  | Choa Chu Kang NPC    |
| Toa Payoh               | Toa Payoh NPC        |
| Tuas                    | Nanyang NPC          |
| Western Islands         | Nanyang NPC          |
| Western Water Catchment | Nanyang NPC          |
| Woodlands               | Woodlands West NPC   |
| Yishun                  | Yishun South NPC     |

**Notes on Mapping****

NPCs covering multiple areas:

- Woodlands West NPC is assigned to Woodlands, Mandai, and Sungei Kadut as it is the closest and most relevant.
- Nanyang NPC is assigned to Tuas, Lim Chu Kang, Pioneer, and Western Water Catchment due to its location in the industrial west.
- Orchard NPC covers multiple central areas like Orchard, Newton, and River Valley.

NPCs for urban centers:

- Marina Bay NPC is assigned to Downtown Core, Singapore River, and Southern Islands, where most major financial institutions and tourist attractions are.
- Rochor NPC is mapped to Rochor and Museum Planning Area since it is close to Bugis and Bras Basah.

Areas with no direct NPCs assigned:

- Areas like Central Water Catchment and Western Water Catchment are mapped to the closest NPCs in Woodlands and Nanyang, respectively.

#### Resale Prices

Singapore's 55 planning areas can be categorized based on the presence of Housing and Development Board (HDB) flats. HDB flats are prevalent in residential towns, while certain areas, primarily industrial zones, nature reserves, or offshore islands, do not have HDB developments.

Planning Areas with HDB Flats:

- Ang Mo Kio: A mature residential town with a significant number of HDB flats.
- Bedok: One of Singapore's largest residential areas, predominantly HDB flats.
- Bishan: Known for its central location and numerous HDB estates.
- Bukit Batok: Features a mix of HDB flats and private housing.
- Bukit Merah: An established area with extensive HDB developments.
- Bukit Panjang: A residential town with a substantial number of HDB flats.
- Bukit Timah: Primarily private housing, but includes some HDB flats.
- Choa Chu Kang: A residential area with numerous HDB estates.
- Clementi: Known for its HDB flats and proximity to educational institutions.
- Geylang: Contains a mix of private and public housing, including HDB flats.
- Hougang: A large residential town with extensive HDB developments.
- Jurong East: Features HDB flats alongside commercial developments.
- Jurong West: One of the largest residential towns with numerous HDB estates.
- Kallang: Includes HDB flats, especially in areas like Kallang/Whampoa. 
- Marine Parade: Features HDB flats with sea views.
- Pasir Ris: A residential town with a significant number of HDB flats.
- Punggol: A newer residential area with many HDB developments.
- Queenstown: Singapore's first satellite town with numerous HDB flats.
- Sembawang: Contains several HDB estates.
- Sengkang: A residential town with extensive HDB developments.
- Serangoon: Features a mix of private and public housing, including HDB flats.
- Tampines: One of Singapore's largest residential towns with numerous HDB estates. 
- Toa Payoh: A mature town with a significant number of HDB flats.
- Woodlands: A major residential area with extensive HDB developments.
- Yishun: Known for its numerous HDB estates.

Planning Areas without HDB Flats:

- Central Water Catchment: Comprises nature reserves and reservoirs; no residential developments.
- Lim Chu Kang: Primarily an agricultural area with minimal residential housing.
- Mandai: Known for wildlife reserves; lacks HDB developments.
- Marina East: Focused on recreational spaces; no HDB flats.
- Marina South: Designated for commercial and recreational use; no HDB developments.
- Museum: Contains cultural institutions; lacks residential housing.
- Newton: Primarily private housing and commercial areas; no HDB flats.
- North-Eastern Islands: Comprises offshore islands with no residential developments.
- Orchard: A commercial district without HDB flats.
- Outram: Contains commercial and healthcare facilities; minimal HDB housing.
- Paya Lebar: Focused on commercial developments; lacks HDB flats.
- Pioneer: An industrial area without residential housing.
- Rochor: Contains commercial and educational institutions; minimal HDB housing.
- Seletar: Known for aerospace industries; lacks HDB developments.
- Simpang: Largely undeveloped with no residential housing.
- Southern Islands: Comprises offshore islands with no HDB flats.
- Straits View: Designated for commercial use; no residential developments.
- Sungei Kadut: An industrial area without HDB housing.
- Tengah: Currently under development; future HDB town. 
- Tuas: An industrial zone with no residential housing.
- Western Islands: Comprises offshore islands with no residential developments.
- Western Water Catchment: Contains water catchment areas; no residential housing.

### Other Assumptions
- **Public Transport**: Focuses on MRT stations (bus stops not included in current version)

## Project Structure

```
homefinder/
├── README.md
├── backend
│   ├── api
│   │   ├── fetch_crimes.py
│   │   ├── fetch_districts.py
│   │   ├── fetch_malls.py
│   │   ├── fetch_resale.py
│   │   ├── fetch_schools.py
│   │   └── fetch_transport.py
│   ├── api_cache
│   │   ├── crimes.csv
│   │   ├── crimes_by_npc.csv
│   │   ├── hdb_resale_prices.csv
│   │   ├── locations_coordinates.csv
│   │   ├── malls_coordinates.csv
│   │   ├── mrt_coordinates.csv
│   │   ├── population_size.csv
│   │   ├── schools_coordinates.csv
│   │   └── top5_crimes_by_npc.csv
│   ├── app.db
│   ├── app.py
│   ├── controllers
│   │   ├── Favorites.py
│   │   ├── LocationDetails.py
│   │   ├── Locations.py
│   │   ├── Notifications.py
│   │   ├── Preferences.py
│   │   ├── Register.py
│   │   ├── Scoring.py
│   │   ├── User.py
│   ├── table_models.py
│   └── test_app.py
├── frontend-new
│   ├── app
│   │   ├── api.tsx
│   │   ├── app.css
│   │   ├── components
│   │   │   ├── FanChart.tsx
│   │   │   ├── LocationDetailSidebar.tsx
│   │   │   ├── NavBar.tsx
│   │   │   ├── ViewLocation.tsx
│   │   │   ├── map
│   │   │   │   ├── CategorySelector.tsx
│   │   │   │   ├── LocationBubble.tsx
│   │   │   │   └── MapPolygonOverlay.tsx
│   │   │   ├── profile
│   │   │   │   ├── SignInForm.tsx
│   │   │   │   ├── SignUpForm.tsx
│   │   │   │   └── UserProfile.tsx
│   │   │   ├── sidebar
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── SideBar.tsx
│   │   │   │   └── SummarisedLocation.tsx
│   │   │   └── view_location
│   │   │       └── CrimeCard.tsx
│   │   ├── contexts
│   │   │   └── MapContext.tsx
│   │   ├── hooks
│   │   │   ├── useLocationBubbles.tsx
│   │   │   ├── useRefocusMap.tsx
│   │   │   └── useSideBar.tsx
│   │   ├── root.tsx
│   │   ├── routes
│   │   │   ├── compare.tsx
│   │   │   ├── explore.tsx
│   │   │   ├── favourites.tsx
│   │   │   └── profile.tsx
│   │   └── routes.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   └── favicon.ico
│   ├── react-router.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── homefinder-readme.md
├── my_tree.txt
└── requirements.txt

## Contributing

We welcome contributions to HomeFinder! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/yourusername/homefinder](https://github.com/yourusername/homefinder)

Team Email: team@homefinder.example.com
