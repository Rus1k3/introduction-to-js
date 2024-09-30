
document.getElementById('changeColorBtn').addEventListener('click', function() {
    const textElement = document.getElementById('text');
    const currentColor = textElement.style.color;

    if (currentColor === 'black') {
        textElement.style.color = 'pink';
    } else {
        textElement.style.color = 'black';
    }
});

document.getElementById('toggleImageBtn').addEventListener('click', function() {
    const imageElement = document.getElementById('image');
    
    if (imageElement.classList.contains('hidden')) {
        imageElement.classList.remove('hidden');
    } else {
        imageElement.classList.add('hidden');
    }
});
