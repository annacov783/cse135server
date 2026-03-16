
document.getElementById('logout-btn').onclick = function() {
    window.location.href = 'logout.php';
};

(function () {
'use strict';

const API_BASE = '/api/items';

/*Fetch Items*/
async function fetchItems() {
    try {
        const res = await fetch(API_BASE, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            throw new Error('Network response not ok');
        }

        const data = await res.json();
        return Array.isArray(data) ? data : [];

    } catch (err) {
        console.error('Error fetching items:', err);
        return [];
    }
}

/*Compute Summary Metrics*/
function computeSummary(items) {

    const sessions = new Set();
    let totalLoad = 0;
    let errorCount = 0;

    items.forEach(item => {

        if (item.session_id) {
            sessions.add(item.session_id);
        }
        
	
	let perf = item.performance;

    	if (typeof perf === "string") {
            perf = JSON.parse(perf);
    	}

    	if (perf && typeof perf.totalLoadTime === "number") {
            totalLoad += perf.totalLoadTime;
    	}

        if (item.type === 'error') {
            errorCount += 1;
        }

    });

    const totalPageviews = items.length;
    const avgLoadTime = totalPageviews > 0
        ? Math.round(totalLoad / totalPageviews)
        : 0;

    return {
        totalPageviews,
        totalSessions: sessions.size,
        avgLoadTime,
        errorCount
    };
}

/*Compute Chart Data*/
function computeChartData(items) {

    const typeCounts = {};

    items.forEach(item => {
        const type = item.type || 'unknown';

        if (!typeCounts[type]) {
            typeCounts[type] = 0;
        }

        typeCounts[type] += 1;
    });

    return {
        labels: Object.keys(typeCounts),
        values: Object.values(typeCounts)
    };
}

/*Utility DOM Creator*/
function createDiv(className) {

    const div = document.createElement('div');

    if (className) {
        div.className = className;
    }

    return div;
}

/*Render Summary Cards*/
function renderCards(summary) {

    const container = document.getElementById('cards');
    if (!container) return;

    const metrics = [
        { label: 'Total Pageviews', value: summary.totalPageviews },
        { label: 'Total Sessions', value: summary.totalSessions },
        { label: 'Avg Load Time', value: summary.avgLoadTime + ' ms' },
        { label: 'Total Errors', value: summary.errorCount }
    ];

    metrics.forEach(metric => {

        const card = createDiv('metric-card');

        const labelDiv = createDiv('metric-label');
        labelDiv.textContent = metric.label;

        const valueDiv = createDiv('metric-value');
        valueDiv.textContent = metric.value;

        card.appendChild(labelDiv);
        card.appendChild(valueDiv);

        container.appendChild(card);

    });
}

/*Render ZingChart*/
function renderChart(items) {

    const chartData = computeChartData(items);

    const config = {
        type: 'bar',
        title: {
            text: 'Event Type Counts'
        },
        scaleX: {
            labels: chartData.labels
        },
        scaleY: {
            label: {
                text: 'Count'
            }
        },
	plot: {
	    barWidth: '40%',
            valueBox: {
            	text: '%v',        
            	placement: 'top',  
            	fontSize: 12,
            	fontColor: '#000'
            }
    	},
        series: [
            {
                values: chartData.values,
                backgroundColor: '#2E86C1'
            }
        ]
    };

    zingchart.render({
        id: 'chart',
        data: config,
        height: '400px',
        width: '100%'
    });
}

/*Render Table*/
function renderTable(items) {

    const container = document.getElementById('items-table');
    if (!container) return;

    const table = document.createElement('table');
    table.className = 'sg-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const headers = [
        'ID',
        'Session',
        'Type',
        'URL',
        'Title',
        'Timestamp'
    ];

    headers.forEach(text => {

        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);

    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    items.forEach(item => {

        const tr = document.createElement('tr');

        function appendCell(value) {
            const td = document.createElement('td');
            td.textContent = value || '-';
            tr.appendChild(td);
        }

        appendCell(item.id);
        appendCell(item.session_id);
        appendCell(item.type);
        appendCell(item.url);
        appendCell(item.title);
        appendCell(item.created_at);

        tbody.appendChild(tr);

    });

    table.appendChild(tbody);
    container.appendChild(table);
}

/*Build Layout*/
function buildLayout(content) {

    const cards = createDiv('summary-cards');
    cards.id = 'cards';

    const chart = createDiv();
    chart.id = 'chart';
    chart.style.height = '400px';
    chart.style.width = '100%';

    const heading = document.createElement('h2');
    heading.textContent = 'Collected Items';

    const tableContainer = createDiv();
    tableContainer.id = 'items-table';

    content.appendChild(cards);
    content.appendChild(chart);
    content.appendChild(heading);
    content.appendChild(tableContainer);
}

async function loadPage(file) {

    const content = document.getElementById('content');
    if (!content) return;

    try {

        const res = await fetch(file);
        const html = await res.text();

        /* clear container */
        content.replaceChildren();

        /* parse HTML */
        const doc = new DOMParser().parseFromString(html, 'text/html');

        /* mount nodes */
        content.append(...doc.body.childNodes);

    } catch (err) {

        console.error(err);

        const msg = document.createElement('p');
        msg.textContent = 'Failed to load page.';
        content.replaceChildren(msg);

    }
}

/*Main Dashboard Renderer*/
async function renderDashboard() {

    const content = document.getElementById('content');
    if (!content) return;

    while (content.firstChild) {
        content.removeChild(content.firstChild);
    }

    buildLayout(content);

    const items = await fetchItems();
    const summary = computeSummary(items);

    renderCards(summary);
    renderChart(items);
    renderTable(items);
}

function loadReportCSS() {
    if (!document.getElementById('report-css')) {
        const link = document.createElement('link');
        link.id = 'report-css';
        link.rel = 'stylesheet';
        link.href = 'report.css';
        document.head.appendChild(link);
    }
}



async function renderReport() {
    loadReportCSS();

    const content = document.getElementById('content');
    if (!content) return;

    // Clear dashboard content
    content.replaceChildren();

    // Wrapper with .report-page instead of container
    const page = document.createElement('div');
    page.className = 'report-page';
    content.appendChild(page);

    // Header + date controls
    const header = document.createElement('div');
    header.className = 'header';
    const h1 = document.createElement('h1');
    h1.textContent = 'Performance Report';
    header.appendChild(h1);

    const controls = document.createElement('div');
    controls.className = 'date-controls';

    const startLabel = document.createElement('label');
    startLabel.setAttribute('for', 'startDate');
    startLabel.textContent = 'From';
    controls.appendChild(startLabel);

    const startDate = document.createElement('input');
    startDate.type = 'date';
    startDate.id = 'startDate';
    controls.appendChild(startDate);

    const endLabel = document.createElement('label');
    endLabel.setAttribute('for', 'endDate');
    endLabel.textContent = 'To';
    controls.appendChild(endLabel);

    const endDate = document.createElement('input');
    endDate.type = 'date';
    endDate.id = 'endDate';
    controls.appendChild(endDate);

    const loadBtn = document.createElement('button');
    loadBtn.id = 'loadBtn';
    loadBtn.textContent = 'Load';
    controls.appendChild(loadBtn);

    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export PDF';
    controls.appendChild(exportBtn);
   
    
    exportBtn.onclick = async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');

        const element = document.querySelector('.report-page');

        // Render DOM to canvas
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pageWidth = doc.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * pageWidth) / canvas.width;

        doc.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
    
        const blob = doc.output('blob');

        const formData = new FormData();
        formData.append('file', blob, 'report.pdf');

        const res = await fetch('/api/save-pdf.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) window.open(data.url, '_blank');
    };



    header.appendChild(controls);
    page.appendChild(header); 

    // Cards
    const cardsDiv = document.createElement('div');
    cardsDiv.className = 'cards';
    ['lcp','cls','inp'].forEach(metric => {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = metric+'Card';

        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = metric.toUpperCase() + ' (p75)';
        card.appendChild(label);

        const value = document.createElement('div');
        value.className = 'value';
        value.id = metric+'Value';
        value.textContent = '\u2014';
        card.appendChild(value);

        const rating = document.createElement('div');
        rating.className = 'rating';
        rating.id = metric+'Rating';
        rating.textContent = 'Loading...';
        card.appendChild(rating);

        cardsDiv.appendChild(card);
    });
    page.appendChild(cardsDiv);


    /*Report 1: Pageview Report*/
    //Pageview  Line Chart

    // Section title
    const pageviewTitle = document.createElement('h2');
    pageviewTitle.textContent = '1. Pageview Report';
    page.appendChild(pageviewTitle);
    

    const chartDiv = document.createElement('div');
    chartDiv.id = 'pageviewsZingLineChart';
    chartDiv.style.width = '100%';
    chartDiv.style.height = '300px';
    page.appendChild(chartDiv);

    //Pageview Table
    const pvTable = document.createElement('table');
    pvTable.className = 'sg-table';

    const pvHead = document.createElement('thead');
    const pvRow = document.createElement('tr');

    ['Date', 'Pageviews'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        pvRow.appendChild(th);
    });

    pvHead.appendChild(pvRow);
    pvTable.appendChild(pvHead);

    const pvBody = document.createElement('tbody');
    pvBody.id = 'pageviewsTableBody';

    pvTable.appendChild(pvBody);

    page.appendChild(pvTable);
    

    //Text box
    const commentContainer = document.createElement('div');
    commentContainer.className = 'report-comment';
    page.appendChild(commentContainer);


    // Title
    const commentTitle = document.createElement('h3');
    commentTitle.textContent = 'Analyst Comment';
    commentContainer.appendChild(commentTitle);

    // Role-based input
    const currentUserRole = window.currentUserRole || 'guest';
     
    console.log(currentUserRole);
    if (currentUserRole === 'admin' || currentUserRole === 'analyst') {
        const textarea = document.createElement('textarea');
        textarea.id = 'commentInput';
        textarea.placeholder = 'Write your comment here...';
        textarea.rows = 4;
        textarea.style.width = '100%';
        commentContainer.appendChild(textarea);

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save Comment';
        saveBtn.onclick = () => {
            const comment = textarea.value.trim();
            if (comment) {
                console.log('Saved comment:', comment);
                displayComment(comment);
            }
        };
        commentContainer.appendChild(saveBtn);
    } 
    

    function displayComment(text) {
        const display = document.createElement('p');
        display.className = 'comment-text';
        display.textContent = text;
        commentContainer.appendChild(display);
    }


    // Table
    const panel = document.createElement('div');
    panel.className = 'panel';

    const panelTitle = document.createElement('h2');
    panelTitle.textContent = 'Per-Page Performance';
    panel.appendChild(panelTitle);

    const tableWrapper = document.createElement('div');
    tableWrapper.style.overflowX = 'auto';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['URL','Avg Load (ms)','Avg TTFB (ms)','Avg LCP (ms)','Avg CLS','Samples'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.id = 'perfBody';
    const emptyTr = document.createElement('tr');
    const emptyTd = document.createElement('td');
    emptyTd.colSpan = 6;
    emptyTd.className = 'empty-state';
    emptyTd.textContent = 'Loading performance data...';
    emptyTr.appendChild(emptyTd);
    tbody.appendChild(emptyTr);

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    panel.appendChild(tableWrapper);
    page.appendChild(panel);

    // Default date range last 30 days
    const today = new Date();
    const thirtyAgo = new Date(Date.now() - 30*86400000);
    startDate.value = formatDate(thirtyAgo);
    endDate.value = formatDate(today);

    // Load and render report data
    async function loadData() {
        const items = await fetchItems(); // use existing API fetch
        renderReportCards(items);
        renderReportTable(items);

	const chartData = getPageviewsOverTime(items);
        const canvas = document.getElementById('pageviewsLineChart');
       
	const itemsZing = await fetchItems();
	renderZingLineChart(itemsZing);



	const pageviewChartData = getPageviewsOverTime(items);
	renderPageviewsTable(pageviewChartData.values);

    }

    function formatDate(d) {
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }

    loadBtn.addEventListener('click', loadData);
    loadData(); // initial load
}



/* Helper to render report cards */
function renderReportCards(items) {
    const totalItems = items.length;
    const sessions = new Set(items.map(i => i.session_id));
    let totalLoad = 0;
    items.forEach(i => {
        let perf = typeof i.performance==='string' ? JSON.parse(i.performance) : i.performance;
        if (perf && perf.totalLoadTime) totalLoad += perf.totalLoadTime;
    });
    const avgLoad = totalItems ? Math.round(totalLoad/totalItems) : 0;

    const metrics = [
        {id:'lcp', value: avgLoad, rating:'Good'},
        {id:'cls', value:'0.05', rating:'Good'},
        {id:'inp', value:'N/A', rating:'Not collected'}
    ];

    metrics.forEach(m => {
        const valEl = document.getElementById(m.id+'Value');
        const ratingEl = document.getElementById(m.id+'Rating');
        if(valEl) valEl.textContent = m.value;
        if(ratingEl) ratingEl.textContent = m.rating;
    });
}


function prevGetPageviewsOverTime(items) {
    const counts = {}; // { '2026-02-26': 10, ... }

    items.forEach(item => {
        if (item.type !== 'pageview') return;


	
        const date = new Date(item.created_at);
        const day = date.toISOString().slice(0,10); // YYYY-MM-DD
        counts[day] = (counts[day] || 0) + 1;
	

	//const label = `${String(date.getMonth() + 1).padStart(2,'0')}/${String(date.getDate()).padStart(2,'0')}`;

        //if (!counts[dayKey]) counts[dayKey] = { date: label, count: 0 };
        //counts[dayKey].count += 1;
    });

    // Sort by date
    const sortedDays = Object.keys(counts).sort();
    //return sortedDays.map(day => counts[day]);
    return sortedDays.map(day => ({ date: day, count: counts[day] }));
} 

function getPageviewsOverTimeZing(items) {
    const counts = {}; // { '2026-02-26': 10 }
    
    items.forEach(item => {
        if (item.type !== 'pageview') return;

        const date = new Date(item.created_at);
        const dayKey = date.toISOString().slice(0,10);

        counts[dayKey] = (counts[dayKey] || 0) + 1;
    });

    const sortedDays = Object.keys(counts).sort();

    // Return labels as MM/DD for X-axis and counts as values
    const labels = sortedDays.map(day => {
        const d = new Date(day);
        return `${d.getMonth()+1}/${d.getDate()}`;
    });

    const values = sortedDays.map(day => counts[day]);

    return { labels, values };
    
}


function getPageviewsOverTime(items) {

    const counts = {};

    items.forEach(item => {

        if (item.type !== 'pageview') return;

        const d = new Date(item.created_at);
        const day = d.toISOString().slice(0,10);

        counts[day] = (counts[day] || 0) + 1;

    });

    const sortedDays = Object.keys(counts).sort();

    return {
        values: sortedDays.map(day => [
            new Date(day).getTime(),
            counts[day]
        ])
    };
}

function renderZingLineChart(items) {
    const data = getPageviewsOverTimeZing(items);

    const config = {
        type: 'line',
        title: {
            text: 'Pageviews Over Time',
            fontSize: 16,
            fontColor: '#2E86C1'
        },
        scaleX: {
	    /*transform: {
                type: "date",
                all: "%m/%d"
            }*/
            labels: data.labels,
            label: { text: 'Date (MM/DD)' },
            guide: { visible: false }
        },
        scaleY: {
            label: { text: 'Pageviews' },
            minValue: 0
        },
        series: [
            {
                values: data.values,
                lineColor: '#2E86C1',
                marker: {
                    backgroundColor: '#2E86C1',
                    size: 4
                }
            }
        ],
        plot: {
            tooltip: {
                text: '%v pageviews'
            }
        },

	valueBox: {
            text: '%v',
            placement: 'top',
            fontSize: 11,
            fontColor: '#333',
            offsetY: -6
        },


        crosshairX: {
            lineColor: '#888',
            marker: { size: 4, backgroundColor: '#2E86C1' },
            plotLabel: { borderRadius: 4, padding: 4 }
        },
        legend: {
            visible: false
        },
        responsive: true
    };

    zingchart.render({
        id: 'pageviewsZingLineChart',
        data: config,
        height: '300px',
        width: '100%'
    });
}

function renderPageviewsTable(dataPoints) {

    const tbody = document.getElementById('pageviewsTableBody');
    if (!tbody) return;

    tbody.replaceChildren();

    dataPoints.forEach(d => {

        const tr = document.createElement('tr');

        const dateCell = document.createElement('td');
        const date = new Date(d[0]);
        dateCell.textContent =
            (date.getMonth()+1) + '/' + date.getDate();

        const countCell = document.createElement('td');
        countCell.textContent = d[1];

        tr.appendChild(dateCell);
        tr.appendChild(countCell);

        tbody.appendChild(tr);

    });
}


/* Helper to render report table */
function renderReportTable(items) {
    const tbody = document.getElementById('perfBody');
    if (!tbody) return;
    tbody.replaceChildren();

    if (!items.length) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.className = 'empty-state';
        td.textContent = 'No data available';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    items.forEach(i => {
        const tr = document.createElement('tr');
        if (i.avg_load_ms > 3000) tr.className = 'slow-row';

        const values = [
            i.url || '-',
            i.avg_load_ms || '-',
            i.avg_ttfb_ms || '-',
            (i.performance && JSON.parse(i.performance).lcp) || '-',
            (i.performance && JSON.parse(i.performance).cls) || '-',
            i.samples || 0
        ];

        values.forEach(v => {
            const td = document.createElement('td');
            td.textContent = v;
            td.style.textAlign = 'right';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}











/*Router*/
function route() {

    const hash = window.location.hash || '#/overview';

    /*Highlight active sidebar link*/
    document.querySelectorAll('.sidebar a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === hash);
    });

    if (hash.startsWith('#/overview')) {
        renderDashboard();
    }

    if (hash.startsWith('#/performance')) {

	renderReport();
    }

}


/*Init*/
document.addEventListener('DOMContentLoaded', function () {
    
    window.addEventListener('hashchange', route);

    route(); 	


	
});

})();
