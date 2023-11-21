import fetch from 'node-fetch'

async function fetchJsonMeteoFromApi (url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data: ', error)
    return null
  }
}

// Exemple d'utilisation
const apiUrl = 'https://www.prevision-meteo.ch/services/json/lat=46.5194190lng=6.6337000' // Remplacez avec votre URL réelle
fetchJsonMeteoFromApi(apiUrl)
  .then(data => console.log(data))
  .catch(error => console.error(error))

export default fetchJsonMeteoFromApi
