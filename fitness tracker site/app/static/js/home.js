document.addEventListener('DOMContentLoaded', () => {
    const greeting = document.querySelector('.greeting');
    const quoteBtn = document.querySelector('#quoteBtn');
    const quoteDisplay = document.querySelector('#quote');

    // Dynamic Greeting
    const hour = new Date().getHours();
    if (hour < 12) greeting.textContent = "Good Morning!";
    else if (hour < 18) greeting.textContent = "Good Afternoon!";
    else greeting.textContent = "Good Evening!";

    // Motivational Quotes
    const quotes = [
        "Push harder than yesterday if you want a better tomorrow.",
        "The pain you feel today will be the strength you feel tomorrow.",
        "Fitness is not about being better than someone else. It's about being better than you used to be."
    ];

    quoteBtn.addEventListener('click', () => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteDisplay.textContent = randomQuote;
    });
});
