document.getElementById('analyze').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.tabs.sendMessage(tab.id, { action: 'getIngredients' }, response => {
      if (!response || !Array.isArray(response.ingredients) || response.ingredients.length === 0) {
        document.getElementById('output').innerText = 'No ingredients found.';
        return;
      }
  
      chrome.runtime.sendMessage({
        action: 'calculateRecipeNutrition',
        ingredients: response.ingredients
      }, res => {
        if (!res.ok) {
          document.getElementById('output').innerText = 'Error: ' + res.error;
          return;
        }
  
        const { calories, protein, fat, carbs } = res.totals;
        document.getElementById('output').innerHTML = `
          <ul>
            <li><strong>Calories:</strong> ${calories.toFixed(0)} kcal</li>
            <li><strong>Protein:</strong> ${protein.toFixed(1)} g</li>
            <li><strong>Fat:</strong> ${fat.toFixed(1)} g</li>
            <li><strong>Carbs:</strong> ${carbs.toFixed(1)} g</li>
          </ul>
        `;
      });
    });
  });
  