/**
 * Quiz Handler Module
 * Quản lý chức năng tạo và hiển thị Quiz
 */

// Khởi tạo module
const QuizHandler = (function () {
    // Biến lưu trữ trạng thái quiz hiện tại
    let quizState = null;
    let timerInterval = null;
    let remainingTime = 0;

    /**
     * Khởi tạo sự kiện cho nút tạo quiz
     */
    function initQuizButton() {
        const quizBtn = document.getElementById('generate-quiz-btn');
        if (!quizBtn) return;

        quizBtn.addEventListener('click', function () {
            const noteId = this.getAttribute('data-note-id');
            const quizModal = new bootstrap.Modal(document.getElementById('quizModal'));
            quizModal.show();

            // Hiển thị form settings và ẩn quiz container
            document.getElementById('quiz-settings').style.display = 'block';
            document.getElementById('quiz-container').style.display = 'none';

            // Xử lý sự kiện submit form
            document.getElementById('quiz-options-form').onsubmit = function (e) {
                e.preventDefault();

                const questionCount = document.getElementById('question-count').value;
                const timeLimit = document.getElementById('time-limit').value;

                // Ẩn form settings và hiển thị loading trong quiz container
                document.getElementById('quiz-settings').style.display = 'none';
                document.getElementById('quiz-container').style.display = 'block';
                document.getElementById('quiz-container').innerHTML = `
                    <div class="text-center">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <p>Generating ${questionCount} quiz questions...</p>
                    </div>
                `;

                // Gửi request để tạo quiz với các tùy chọn
                generateQuiz(noteId, questionCount, timeLimit);
            };
        });
    }

    /**
     * Gửi request để tạo quiz với các tùy chọn
     * @param {string} noteId - ID của note
     * @param {number} questionCount - Số lượng câu hỏi
     * @param {number} timeLimit - Thời gian làm bài (phút)
     */
    function generateQuiz(noteId, questionCount, timeLimit) {
        fetch(`/api/generate-quiz/${noteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question_count: parseInt(questionCount),
                time_limit: parseInt(timeLimit)
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayQuiz(data.quiz, parseInt(timeLimit));
                } else {
                    document.getElementById('quiz-container').innerHTML = `
                    <div class="alert alert-danger">
                        Failed to generate quiz: ${data.error}
                    </div>
                    <div class="d-grid gap-2 mt-3">
                        <button class="btn btn-secondary" onclick="document.getElementById('quiz-settings').style.display = 'block'; document.getElementById('quiz-container').style.display = 'none';">
                            Back to Settings
                        </button>
                    </div>
                `;
                }
            })
            .catch(error => {
                document.getElementById('quiz-container').innerHTML = `
                <div class="alert alert-danger">
                    Error: ${error}
                </div>
                <div class="d-grid gap-2 mt-3">
                    <button class="btn btn-secondary" onclick="document.getElementById('quiz-settings').style.display = 'block'; document.getElementById('quiz-container').style.display = 'none';">
                        Back to Settings
                    </button>
                </div>
            `;
            });
    }

    /**
     * Hiển thị quiz với chế độ một câu hỏi mỗi lần
     * @param {Object} quizData - Dữ liệu quiz từ API
     * @param {number} timeLimit - Thời gian làm bài (phút)
     */
    function displayQuiz(quizData, timeLimit) {
        const quizContainer = document.getElementById('quiz-container');

        console.log("Starting quiz with time limit:", timeLimit, "minutes");

        // Dừng timer cũ nếu có
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        // Tạo biến để lưu trữ dữ liệu quiz và trạng thái hiện tại
        quizState = {
            currentQuestion: 0,
            totalQuestions: quizData.quiz.length,
            questions: quizData.quiz,
            userAnswers: new Array(quizData.quiz.length).fill(-1), // -1 là chưa chọn đáp án
            tempAnswers: new Array(quizData.quiz.length).fill(-1), // Lựa chọn tạm thời
            showExplanation: new Array(quizData.quiz.length).fill(false),
            timeLimit: timeLimit, // Lưu thời gian giới hạn (phút)
            startTime: new Date().getTime(), // Lưu thời điểm bắt đầu
            endTime: timeLimit > 0 ? new Date().getTime() + (timeLimit * 60 * 1000) : 0 // Tính thời điểm kết thúc
        };

        // Bắt đầu với câu hỏi đầu tiên
        renderCurrentQuestion();

        // Bắt đầu đếm ngược nếu có giới hạn thời gian
        if (timeLimit > 0) {
            console.log("Setting up timer with", timeLimit * 60, "seconds");
            remainingTime = timeLimit * 60; // Chuyển đổi sang giây
            startTimer();
        } else {
            console.log("No time limit for this quiz");
            // Ẩn timer nếu không có giới hạn thời gian
            const timerContainer = document.getElementById('quiz-timer-container');
            if (timerContainer) {
                timerContainer.classList.add('d-none');
            }
        }
    }

    /**
     * Bắt đầu đếm ngược thời gian
     */
    function startTimer() {
        // Tìm và hiển thị timer container có sẵn trong modal thay vì tạo mới
        const timerContainer = document.getElementById('quiz-timer-container');
        const timerElement = timerContainer.querySelector('.quiz-timer');

        if (timerContainer) {
            // Hiển thị timer
            timerContainer.classList.remove('d-none');

            // Khởi tạo timer với thời gian ban đầu
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        const updateTimer = () => {
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                // Khi hết thời gian, tự động nộp bài
                showTimeUpAlert();
                return;
            }

            remainingTime--;

            // Cập nhật hiển thị thời gian
            if (timerElement) {
                const minutes = Math.floor(remainingTime / 60);
                const seconds = remainingTime % 60;

                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                // Thêm các class cảnh báo khi gần hết thời gian
                if (remainingTime <= 60) { // Dưới 1 phút
                    timerElement.classList.add('danger');
                    timerElement.classList.remove('warning');
                } else if (remainingTime <= 180) { // Dưới 3 phút
                    timerElement.classList.add('warning');
                    timerElement.classList.remove('danger');
                }
            }
        };

        // Khởi tạo timer và cập nhật mỗi giây
        timerInterval = setInterval(updateTimer, 1000);
        updateTimer(); // Cập nhật ngay lập tức
    }

    /**
     * Hiển thị thông báo hết thời gian và nộp bài tự động
     */
    function showTimeUpAlert() {
        // Hiển thị thông báo hết thời gian
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-warning alert-dismissible fade show';
        alertElement.style.position = 'absolute';
        alertElement.style.top = '50%';
        alertElement.style.left = '50%';
        alertElement.style.transform = 'translate(-50%, -50%)';
        alertElement.style.zIndex = '1060';
        alertElement.innerHTML = `
            <strong>Time's up!</strong> Your quiz is being automatically submitted...
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Thêm vào modal body thay vì document body
        const modalBody = document.querySelector('#quizModal .modal-body');
        if (modalBody) {
            modalBody.appendChild(alertElement);
        }
        
        // Nộp bài sau 2 giây
        setTimeout(() => {
            // Xóa thông báo nếu vẫn còn
            if (alertElement.parentNode) {
                alertElement.parentNode.removeChild(alertElement);
            }
            // Nộp bài
            showQuizResults();
        }, 2000);
    }
    
    /**
     * Lưu lựa chọn hiện tại của người dùng
     */
    function saveCurrentSelection() {
        const qIndex = quizState.currentQuestion;
        const selectedOption = document.querySelector(`input[name="question-${qIndex}"]:checked`);
        
        if (selectedOption) {
            const selectedValue = parseInt(selectedOption.value);
            quizState.tempAnswers[qIndex] = selectedValue;
            
            // Đánh dấu là câu hỏi đã được chọn tạm thời
            const dot = document.querySelector(`.quiz-progress-dot[data-question="${qIndex}"]`);
            if (dot) {
                dot.classList.add('temp-answered');
            }
        }
    }

    /**
     * Render câu hỏi hiện tại
     */
    function renderCurrentQuestion() {
        const quizContainer = document.getElementById('quiz-container');
        const q = quizState.questions[quizState.currentQuestion];
        const qIndex = quizState.currentQuestion;
        
        // Ưu tiên sử dụng đáp án đã check, nếu không thì sử dụng đáp án tạm thời
        const userAnswer = quizState.userAnswers[qIndex] >= 0 ? quizState.userAnswers[qIndex] : quizState.tempAnswers[qIndex];
        const showExpl = quizState.showExplanation[qIndex];
        
        // Kiểm tra xem câu hỏi này đã được check answer chưa
        const isAnswerChecked = quizState.showExplanation[qIndex];

        let questionHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Question ${qIndex + 1} of ${quizState.totalQuestions}</h5>
            </div>
            
            <div class="card quiz-question" id="question-${qIndex}">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div class="quiz-progress">
                        ${Array(quizState.totalQuestions).fill(0).map((_, i) =>
            `<span class="quiz-progress-dot ${i === qIndex ? 'active' : ''} 
                                      ${quizState.userAnswers[i] >= 0 ? 'answered' : (quizState.tempAnswers[i] >= 0 ? 'temp-answered' : '')}"
                                  data-question="${i}"></span>`
        ).join('')}
                    </div>
                </div>
                <div class="card-body">
                    <p class="card-text fw-bold">${q.question}</p>
                    <div class="options">
        `;

        q.options.forEach((option, oIndex) => {
            const isSelected = userAnswer === oIndex;
            const isCorrect = oIndex === q.answer;
            let optionClass = "";

            // Nếu người dùng đã chọn câu trả lời và đúng
            if (isSelected && isCorrect && isAnswerChecked) {
                optionClass = "text-success fw-bold";
            }
            // Nếu người dùng đã chọn câu trả lời nhưng sai
            else if (isSelected && !isCorrect && isAnswerChecked) {
                optionClass = "text-danger text-decoration-line-through";
            }
            // Nếu đây là đáp án đúng và người dùng đã trả lời (hiển thị đáp án đúng)
            else if (isCorrect && isAnswerChecked) {
                optionClass = "text-success fw-bold";
            }
            // Nếu người dùng đã chọn nhưng chưa check answer (lựa chọn tạm thời)
            else if (isSelected && !isAnswerChecked) {
                optionClass = "selected-temp";
            }

            questionHTML += `
                <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" name="question-${qIndex}" 
                           id="q${qIndex}o${oIndex}" value="${oIndex}" 
                           data-correct="${isCorrect}"
                           ${isSelected ? 'checked' : ''}
                           ${isAnswerChecked ? 'disabled' : ''}>
                    <label class="form-check-label ${optionClass}" for="q${qIndex}o${oIndex}">
                        ${option}
                    </label>
                </div>
            `;
        });

        questionHTML += `
                    </div>
                    <div class="explanation mt-3 ${showExpl ? '' : 'd-none'}">
                        <div class="alert alert-info">
                            <strong>Explanation:</strong> ${q.explanation}
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-secondary" ${qIndex === 0 ? 'disabled' : ''} 
                                id="prev-question">Previous</button>
                        <div>
                            <button class="btn btn-sm btn-info" id="toggle-explanation" ${!showExpl && userAnswer === -1 ? 'disabled' : ''}>
                                ${showExpl ? 'Hide' : 'Show'} Explanation
                            </button>
                            <button class="btn btn-sm btn-success ms-2" id="check-answer" 
                                    ${isAnswerChecked || userAnswer === -1 ? 'disabled' : ''}>
                                Check Answer
                            </button>
                        </div>
                        <button class="btn btn-sm btn-outline-secondary" ${qIndex === quizState.totalQuestions - 1 ? 'disabled' : ''} 
                                id="next-question">Next</button>
                    </div>
                </div>
            </div>
            
            <!-- Quiz Submit Button -->
            <div class="d-grid gap-2 mt-4">
                <button class="btn btn-primary" id="show-results">Submit Quiz</button>
            </div>
        `;

        quizContainer.innerHTML = questionHTML;

        // Thêm event listeners cho các nút điều hướng
        document.getElementById('prev-question')?.addEventListener('click', () => {
            if (quizState.currentQuestion > 0) {
                // Lưu lựa chọn hiện tại trước khi chuyển trang
                saveCurrentSelection();
                
                quizState.currentQuestion--;
                renderCurrentQuestion();
            }
        });

        document.getElementById('next-question')?.addEventListener('click', () => {
            if (quizState.currentQuestion < quizState.totalQuestions - 1) {
                // Lưu lựa chọn hiện tại trước khi chuyển trang
                saveCurrentSelection();
                
                quizState.currentQuestion++;
                renderCurrentQuestion();
            }
        });

        // Event listener cho việc kiểm tra câu trả lời
        document.getElementById('check-answer')?.addEventListener('click', () => {
            const selectedOption = document.querySelector(`input[name="question-${qIndex}"]:checked`);
            if (selectedOption) {
                const selectedValue = parseInt(selectedOption.value);
                quizState.userAnswers[qIndex] = selectedValue;
                quizState.tempAnswers[qIndex] = selectedValue; // Cập nhật cả lựa chọn tạm thời
                quizState.showExplanation[qIndex] = true;
                
                // Cập nhật giao diện hiển thị
                const dot = document.querySelector(`.quiz-progress-dot[data-question="${qIndex}"]`);
                if (dot) {
                    dot.classList.remove('temp-answered');
                    dot.classList.add('answered');
                }
                
                renderCurrentQuestion();
            } else {
                alert("Please select an answer first");
            }
        });

        // Event listener cho việc hiển thị/ẩn giải thích
        document.getElementById('toggle-explanation')?.addEventListener('click', () => {
            quizState.showExplanation[qIndex] = !quizState.showExplanation[qIndex];
            renderCurrentQuestion();
        });

        // Event listener cho nút Submit Quiz
        document.getElementById('show-results')?.addEventListener('click', () => {
            // Lưu lại lựa chọn hiện tại trước khi nộp bài
            saveCurrentSelection();
            
            // Kiểm tra xem có câu hỏi nào chưa trả lời không
            const unansweredCount = quizState.tempAnswers.filter(a => a === -1).length;

            if (unansweredCount > 0) {
                if (!confirm(`You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`)) {
                    return;
                }
            }

            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            // Xóa timer container nếu có
            const timerContainer = document.querySelector('.quiz-timer-container');
            if (timerContainer) {
                timerContainer.classList.add('d-none');
            }

            showQuizResults();
        });

        // Event listener cho các điểm tiến trình để nhảy đến câu hỏi
        document.querySelectorAll('.quiz-progress-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                // Lưu lựa chọn hiện tại trước khi chuyển trang
                saveCurrentSelection();
                
                const questionIndex = parseInt(dot.getAttribute('data-question'));
                quizState.currentQuestion = questionIndex;
                renderCurrentQuestion();
            });
        });

        // Thêm listeners cho radio buttons
        document.querySelectorAll(`input[name="question-${qIndex}"]`).forEach(radio => {
            radio.addEventListener('change', () => {
                const selectedValue = parseInt(radio.value);
                quizState.tempAnswers[qIndex] = selectedValue;
                
                // Đánh dấu là câu hỏi đã được chọn tạm thời
                const dot = document.querySelector(`.quiz-progress-dot[data-question="${qIndex}"]`);
                if (dot && !dot.classList.contains('answered')) {
                    dot.classList.add('temp-answered');
                }
                
                // Kích hoạt nút Check Answer
                if (!isAnswerChecked) {
                    document.getElementById('check-answer').disabled = false;
                }
            });
        });
    }

    /**
     * Hiển thị kết quả cuối cùng của quiz
     */
    function showQuizResults() {
        // Chuyển các lựa chọn tạm thời thành chính thức
        for (let i = 0; i < quizState.totalQuestions; i++) {
            // Nếu câu hỏi chưa có đáp án chính thức nhưng có đáp án tạm
            if (quizState.userAnswers[i] === -1 && quizState.tempAnswers[i] >= 0) {
                quizState.userAnswers[i] = quizState.tempAnswers[i];
            }
        }
        
        // Xóa timer nếu có
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Ẩn timer container
        const timerContainer = document.getElementById('quiz-timer-container');
        if (timerContainer) {
            timerContainer.classList.add('d-none');
        }
    
        const quizContainer = document.getElementById('quiz-container');
        const correctAnswers = quizState.userAnswers.filter((answer, index) =>
            answer === quizState.questions[index].answer
        ).length;

        const percentage = Math.round((correctAnswers / quizState.totalQuestions) * 100);
        let resultClass, resultMessage;

        if (percentage >= 80) {
            resultClass = "alert-success";
            resultMessage = "Excellent! You've mastered this content!";
        } else if (percentage >= 60) {
            resultClass = "alert-info";
            resultMessage = "Good job! You have a solid understanding.";
        } else {
            resultClass = "alert-warning";
            resultMessage = "You might want to review the material again.";
        }

        // Tính thời gian đã sử dụng (nếu có)
        let timeUsedHTML = '';
        if (quizState.timeLimit > 0) {
            const totalTimeSeconds = quizState.timeLimit * 60;
            const timeUsedSeconds = totalTimeSeconds - remainingTime;
            const minutes = Math.floor(timeUsedSeconds / 60);
            const seconds = timeUsedSeconds % 60;

            timeUsedHTML = `
                <p class="text-muted">Time used: ${minutes} min ${seconds} sec</p>
            `;
        }

        let resultsHTML = `
            <div class="text-center mb-4">
                <h4>Quiz Results</h4>
                <div class="alert ${resultClass}">
                    <p class="mb-1">You answered ${correctAnswers} out of ${quizState.totalQuestions} questions correctly.</p>
                    <h5 class="mb-0">Score: ${percentage}%</h5>
                </div>
                ${timeUsedHTML}
                <p>${resultMessage}</p>
            </div>
            
            <div class="question-summary">
                <h5>Question Summary:</h5>
                <div class="list-group">
        `;

        quizState.questions.forEach((q, i) => {
            const isCorrect = quizState.userAnswers[i] === q.answer;
            const userAnswer = quizState.userAnswers[i] >= 0 ? q.options[quizState.userAnswers[i]] : "Not answered";
            const correctAnswer = q.options[q.answer];

            resultsHTML += `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <span class="badge ${isCorrect ? 'bg-success' : 'bg-danger'} me-2">
                                ${isCorrect ? '✓' : '✗'}
                            </span>
                            Question ${i + 1}
                        </div>
                        <button class="btn btn-sm btn-outline-primary review-question" data-question="${i}">
                            Review
                        </button>
                    </div>
                    <div class="small text-muted mb-1">
                        <strong>Your answer:</strong> ${userAnswer}
                    </div>
                    <div class="small ${isCorrect ? 'text-success' : 'text-danger'}">
                        <strong>Correct answer:</strong> ${correctAnswer}
                    </div>
                </div>
            `;
        });

        resultsHTML += `
                </div>
            </div>
            
            <div class="text-center mt-4">
                <button class="btn btn-primary" id="restart-quiz">Review All Questions</button>
                <button class="btn btn-outline-secondary ms-2" data-bs-dismiss="modal">Close</button>
            </div>
        `;

        quizContainer.innerHTML = resultsHTML;

        // Event listeners cho trang kết quả
        document.querySelectorAll('.review-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const questionIndex = parseInt(btn.getAttribute('data-question'));
                quizState.currentQuestion = questionIndex;
                renderCurrentQuestion();
            });
        });

        document.getElementById('restart-quiz')?.addEventListener('click', () => {
            quizState.currentQuestion = 0;
            renderCurrentQuestion();
        });
    }

    // Public API
    return {
        init: function () {
            initQuizButton();
        }
    };
})();

// Khởi tạo module khi trang đã tải xong
document.addEventListener('DOMContentLoaded', QuizHandler.init);