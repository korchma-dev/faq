document.addEventListener('DOMContentLoaded', () => {
    let currentLang = 'en';

    const offset = 10; // Отступ для прилипания
    const stickyClass = 'sticky';

    // Загружаем тексты из файла
    function loadTexts(lang) {
        fetch(`lang/${lang}.json`)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load language file: ${response.status}`);
                return response.json();
            })
            .then(data => {
                document.querySelector('.faq-title').textContent = data.title;
                const faqContainer = document.querySelector('.faq-items');
                faqContainer.innerHTML = '';

                data.faqs.forEach((faq, index) => {
                    const faqItem = document.createElement('div');
                    faqItem.className = 'faq-item';
                    faqItem.id = `faq${index + 1}`;

                    faqItem.innerHTML = `
                        <div class="faq-question">
                            <span>${faq.question}</span>
                            <span class="faq-icon">&#9660;</span>
                        </div>
                        <div class="faq-answer"></div>
                    `;

                    const answer = faqItem.querySelector('.faq-answer');
                    renderContent(answer, faq.content);
                    faqContainer.appendChild(faqItem);

                    const question = faqItem.querySelector('.faq-question');
                    const icon = faqItem.querySelector('.faq-icon');
                    question.addEventListener('click', () => {
                        document.querySelectorAll('.faq-answer.open').forEach(openAnswer => {
                            if (openAnswer !== answer) {
                                openAnswer.classList.remove('open');
                                openAnswer.previousElementSibling.querySelector('.faq-icon').classList.remove('open');
                            }
                        });

                        answer.classList.toggle('open');
                        icon.classList.toggle('open');
                    });
                });

                scrollToFaq();
            })
            .catch(error => console.error('Error loading texts:', error));
    }

    function renderContent(container, content) {
        content.forEach(item => {
            if (item.type === 'text') {
                const paragraph = document.createElement('p');
                paragraph.textContent = item.value;
                container.appendChild(paragraph);
            } else if (item.type === 'image') {
                const image = document.createElement('img');
                image.src = item.src;
                image.alt = item.alt || 'Image';
                container.appendChild(image);
            } else if (item.type === 'nested') {
                const nestedContainer = document.createElement('div');
                nestedContainer.classList.add('nested-container');
                item.subquestions.forEach(sub => {
                    const nestedQuestion = document.createElement('div');
                    nestedQuestion.classList.add('nested-question');
                    nestedQuestion.textContent = sub.subquestion;

                    const nestedAnswer = document.createElement('div');
                    nestedAnswer.classList.add('nested-answer');
                    renderContent(nestedAnswer, sub.content);

                    nestedContainer.appendChild(nestedQuestion);
                    nestedContainer.appendChild(nestedAnswer);
                    container.appendChild(nestedContainer);

                    nestedQuestion.addEventListener('click', () => {
                        nestedAnswer.classList.toggle('open');
                    });
                });
            }
        });
    }

    function stickQuestion(question, faqItem) {
        const faqRect = faqItem.getBoundingClientRect();
        question.style.position = 'fixed';
        question.style.top = `${offset}px`;
        question.style.left = `${faqRect.left}px`;
        question.style.width = `${faqRect.width}px`;
        question.style.zIndex = '1000';
        question.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        question.classList.add(stickyClass);
    }

    function resetSticky(question) {
        question.style.cssText = ''; // Сброс стилей
        question.classList.remove(stickyClass);
    }

    function handleScroll() {
        document.querySelectorAll('.faq-item').forEach(faqItem => {
            const question = faqItem.querySelector('.faq-question');
            const answer = faqItem.querySelector('.faq-answer');
            const rect = faqItem.getBoundingClientRect();

            if (rect.top <= offset && rect.bottom > question.offsetHeight && answer.classList.contains('open')) {
                stickQuestion(question, faqItem);
            } else {
                resetSticky(question);
            }
        });
    }

    function scrollToFaq() {
        const urlParams = new URLSearchParams(window.location.search);
        const faqToOpen = urlParams.get('faq');
        if (faqToOpen) {
            const faqElement = document.getElementById(faqToOpen);
            if (faqElement) {
                const question = faqElement.querySelector('.faq-question');
                const answer = faqElement.querySelector('.faq-answer');
                const icon = faqElement.querySelector('.faq-icon');

                answer.classList.add('open');
                icon.classList.add('open');
                setTimeout(() => faqElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
            }
        }
    }

    document.querySelectorAll('.lang-switch button').forEach(button => {
        button.addEventListener('click', function () {
            const lang = this.getAttribute('data-lang');
            currentLang = lang;
            loadTexts(lang);
        });
    });

    loadTexts(currentLang);
    window.addEventListener('scroll', handleScroll);
});
