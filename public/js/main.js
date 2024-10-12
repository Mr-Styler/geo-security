document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('locationForm');
    const resultDiv = document.getElementById('result');
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const lat = document.getElementById('latitude').value;
      const lon = document.getElementById('longitude').value;
  
      try {
        const response = await fetch(`/analyze-location?lat=${lat}&lon=${lon}`);
        const data = await response.json();
  
        if (response.ok) {
          displayResults(data);
        } else {
          resultDiv.innerHTML = `<p>Error: ${data.error}</p>`;
        }
      } catch (error) {
        resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
      }
    });
  
    function displayResults(data) {
      const { city, analysis } = data;
  
      resultDiv.innerHTML = `
        <h2>Analysis for ${city}</h2>
        <h3>Weather Data:</h3>
        <p>Temperature: ${analysis.weather.main.temp} °C</p>
        <p>Humidity: ${analysis.weather.main.humidity}%</p>
        <h3>Social Media Sentiment:</h3>
        <p>Average Sentiment: ${analysis.socialMediaSentiment}</p>
        <h3>Hostility Level: ${analysis.hostilityLevel}</h3>
        <h3>Crime Analysis Results:</h3>
        <ul>
          ${analysis.analysisResults.map(result => `
            <li>
              Crime: ${result.classification}, 
              Sentiment Score: ${result.sentimentScore}
            </li>
          `).join('')}
        </ul>
      `;
    }
  });
  