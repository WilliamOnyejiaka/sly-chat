
// Dark mode toggle
const toggleButton = document.getElementById('dark-mode-toggle');
const body = document.body;

if (localStorage.getItem('darkMode') === 'true' ||
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    body.classList.add('dark-mode');
}

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark.toString());
});

// Make code blocks collapsible
document.querySelectorAll('pre').forEach(pre => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Code (click to expand)';
    details.appendChild(summary);
    pre.parentNode.insertBefore(details, pre);
    details.appendChild(pre);
});

// Assuming hljs is loaded via CDN
document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
});