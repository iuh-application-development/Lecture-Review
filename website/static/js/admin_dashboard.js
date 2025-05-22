// Hàm để tạo và cấu hình biểu đồ notes
function setupNotesChart(notesChartData) {
    // Cấu hình biểu đồ Notes - Tổng số Note
    const totalNotesConfig = {
        type: 'scatter',
        mode: 'lines',
        x: notesChartData.dates,
        y: notesChartData.total_notes,
        name: 'Total Notes',
        line: {
            color: '#36a2eb',
            width: 3,
            shape: 'spline'
        },
        fill: 'tozeroy',
        fillcolor: 'rgba(54, 162, 235, 0.2)'
    };
    
    // Cấu hình biểu đồ Notes - Public Notes
    const publicNotesConfig = {
        type: 'scatter',
        mode: 'lines',
        x: notesChartData.dates,
        y: notesChartData.public_notes,
        name: 'Public Notes',
        line: {
            color: '#4bc0c0',
            width: 2,
            shape: 'spline'
        }
    };
    
    // Cấu hình biểu đồ Notes - Shared Notes
    const sharedNotesConfig = {
        type: 'scatter',
        mode: 'lines',
        x: notesChartData.dates,
        y: notesChartData.shared_notes,
        name: 'Shared Notes',
        line: {
            color: '#ffcd56',
            width: 2,
            shape: 'spline',
            dash: 'dot'
        }
    };
    
    // Layout cho biểu đồ Notes
    const notesLayout = {
        xaxis: {
            title: 'Date',
            showgrid: true,
            gridcolor: '#e6e6e6'
        },
        yaxis: {
            title: 'Total Number of Notes',
            showgrid: true,
            gridcolor: '#e6e6e6'
        },
        margin: {
            l: 50,
            r: 20,
            t: 40,
            b: 50
        },
        hovermode: 'closest',
        showlegend: false,
        plot_bgcolor: '#f8f9fa',
        paper_bgcolor: '#f8f9fa'
    };
    
    // Tạo biểu đồ Notes
    Plotly.newPlot('notes-chart', [totalNotesConfig, publicNotesConfig, sharedNotesConfig], notesLayout, {
        responsive: true,
        displayModeBar: false // Ẩn thanh công cụ khi hover
    });
}

// Hàm để tạo và cấu hình biểu đồ accounts
function setupAccountsChart(accountsChartData) {
    // Cấu hình biểu đồ Accounts
    const accountsChartConfig = {
        type: 'scatter',
        mode: 'lines',
        x: accountsChartData.dates,
        y: accountsChartData.counts,
        name: 'Total Accounts',
        line: {
            color: '#ff6384',
            width: 2,
            shape: 'spline'
        },
        marker: {
            color: '#ff6384',
            size: 8,
            symbol: 'circle',
            line: {
                color: '#000',
                width: 1
            }
        },
        fill: 'tozeroy',
        fillcolor: 'rgba(255, 99, 132, 0.2)'
    };
    
    // Layout cho biểu đồ Accounts
    const accountsLayout = {
        xaxis: {
            title: 'Date',
            showgrid: true,
            gridcolor: '#e6e6e6'
        },
        yaxis: {
            title: 'Total Number of Accounts',
            showgrid: true,
            gridcolor: '#e6e6e6'
        },
        margin: {
            l: 50,
            r: 20,
            t: 40,
            b: 50
        },
        hovermode: 'closest',
        showlegend: false,
        plot_bgcolor: '#f8f9fa',
        paper_bgcolor: '#f8f9fa'
    };
    
    // Tạo biểu đồ Accounts
    Plotly.newPlot('accounts-chart', [accountsChartConfig], accountsLayout, {
        responsive: true,
        displayModeBar: false // Ẩn thanh công cụ khi hover
    });
}

// Hàm khởi tạo tất cả biểu đồ
function initializeCharts(notesChartData, accountsChartData) {
    setupNotesChart(notesChartData);
    setupAccountsChart(accountsChartData);
    
    // Làm cho biểu đồ responsive
    window.addEventListener('resize', function() {
        Plotly.relayout('notes-chart', {
            'xaxis.autorange': true,
            'yaxis.autorange': true
        });
        Plotly.relayout('accounts-chart', {
            'xaxis.autorange': true,
            'yaxis.autorange': true
        });
    });
}

// Khi DOM đã sẵn sàng, khởi tạo các biểu đồ với dữ liệu từ template
document.addEventListener('DOMContentLoaded', function() {
    // Dữ liệu được truyền từ template sẽ được gán ở template
    if (typeof notesChartData !== 'undefined' && typeof accountsChartData !== 'undefined') {
        initializeCharts(notesChartData, accountsChartData);
    }
});
