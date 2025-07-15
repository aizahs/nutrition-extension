

importScripts('secret.js');

async function fetchNutritionix(ingredient) {
  const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-id': APP_ID,
      'x-app-key': APP_KEY
    },
    body: JSON.stringify({ query: ingredient })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Nutritionix error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.foods[0]; 
}

function summarizeNutrition(nutritionDataList) {
  const totals = { calories: 0, protein: 0, fat: 0, carbs: 0 };

  nutritionDataList.forEach(item => {
    totals.calories += item.nf_calories || 0;
    totals.protein  += item.nf_protein || 0;
    totals.fat      += item.nf_total_fat || 0;
    totals.carbs    += item.nf_total_carbohydrate || 0;
  });

  return totals;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'calculateRecipeNutrition' && Array.isArray(msg.ingredients)) {
    (async () => {
      try {
        const allData = [];
        for (const ingredient of msg.ingredients) {
          try {
            const data = await fetchNutritionix(ingredient);
            allData.push(data);
          } catch (err) {
            console.warn(`Skipping: ${ingredient} - ${err.message}`);
          }
        }

        const totals = summarizeNutrition(allData);
        sendResponse({ ok: true, totals });
      } catch (error) {
        sendResponse({ ok: false, error: error.message });
      }
    })();
    return true;
  }
});
