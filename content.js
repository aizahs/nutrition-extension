function extractIngredients() {
// Gets text from the elements that hold the ingredients on FoodNetwork
  const spans = Array.from(
    document.querySelectorAll('.o-Ingredients__a-Ingredient--CheckboxLabel')
  ).map(el => el.innerText.trim());
// Gets text from the label for the same reason, in case the first way doesnt work
  const labels = Array.from(
    document.querySelectorAll('label.o-Ingredients__a-Ingredient')
  ).map(el => el.innerText.trim());

  // Cleans it up
  const combined = [...spans, ...labels].filter(
    (text, index, self) => text && self.indexOf(text) === index
  );

  return combined.length > 0 ? combined : [];
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'getIngredients') {
    const ingredients = extractIngredients();
    console.log('🧂 Ingredients found:', ingredients);
    sendResponse({ ingredients });
  }
});
