# Home Finder App
### An app to find your ideal neighbourhood to buy that dream BTO!!



### Assumptions:

#### Crime Rate
Below is our mapping of Singapore's Neighbourhood Police Centres (NPCs) to the 55 URA planning areas, ensuring that each planning area is assigned to the most relevant or closest NPC while allowing NPCs to cover multiple planning areas. 

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
