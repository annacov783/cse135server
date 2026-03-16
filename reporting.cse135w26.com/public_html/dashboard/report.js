window.reportFragment = (function() {
    'use strict';

    function createReportPage() {
        const page = document.createElement('div');
        page.className = 'report-page';

        // Header
        const header = document.createElement('div');
        header.className = 'header';

        const h1 = document.createElement('h1');
        h1.textContent = 'Performance Report';
        header.appendChild(h1);

        const controls = document.createElement('div');
        controls.className = 'date-controls';

        const labelFrom = document.createElement('label');
        labelFrom.setAttribute('for','startDate');
        labelFrom.textContent = 'From';
        controls.appendChild(labelFrom);

        const startDate = document.createElement('input');
        startDate.type = 'date';
        startDate.id = 'startDate';
        controls.appendChild(startDate);

        const labelTo = document.createElement('label');
        labelTo.setAttribute('for','endDate');
        labelTo.textContent = 'To';
        controls.appendChild(labelTo);

        const endDate = document.createElement('input');
        endDate.type = 'date';
        endDate.id = 'endDate';
        controls.appendChild(endDate);

        const loadBtn = document.createElement('button');
        loadBtn.id = 'loadBtn';
        loadBtn.textContent = 'Load';
        controls.appendChild(loadBtn);

        header.appendChild(controls);
        page.appendChild(header);

        // Container
        const container = document.createElement('div');
        container.className = 'container';

        const errorBox = document.createElement('div');
        errorBox.id = 'errorBox';
        errorBox.className = 'error-msg';
        container.appendChild(errorBox);

        // Cards
        const cardsDiv = document.createElement('div');
        cardsDiv.className = 'cards';

        ['lcp','cls','inp'].forEach(metric => {
            const card = document.createElement('div');
            card.className = 'card';
            card.id = metric + 'Card';

            const label = document.createElement('div');
            label.className = 'label';
            label.textContent = metric.toUpperCase() + ' (p75)';
            card.appendChild(label);

            const value = document.createElement('div');
            value.className = 'value';
            value.id = metric + 'Value';
            value.textContent = '\u2014';
            card.appendChild(value);

            const rating = document.createElement('div');
            rating.className = 'rating';
            rating.id = metric + 'Rating';
            rating.textContent = 'Loading...';
            card.appendChild(rating);

            cardsDiv.appendChild(card);
        });

        container.appendChild(cardsDiv);

        // Panel
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
        container.appendChild(panel);

        page.appendChild(container);

        return page;
    }



    function init() {
        const loadBtn = document.getElementById('loadBtn');
        loadBtn.addEventListener('click', loadData);

        // Set default date range: last 30 days
        const today = new Date();
        const thirtyAgo = new Date(Date.now() - 30 * 86400000);
        document.getElementById('endDate').value = formatDate(today);
        document.getElementById('startDate').value = formatDate(thirtyAgo);

        // Initial load
        loadData();
    }

    // Helper: format date as yyyy-mm-dd
    function formatDate(d) {
        return d.getFullYear() + '-' +
               String(d.getMonth() + 1).padStart(2, '0') + '-' +
               String(d.getDate()).padStart(2, '0');
    }

    // Example: loadData() function (fetch API and populate cards/table)
    async function loadData() {
        const start = document.getElementById('startDate').value;
        const end = document.getElementById('endDate').value;
        const errorBox = document.getElementById('errorBox');
        errorBox.textContent = '';

        if (!start || !end) {
            errorBox.textContent = 'Please select both start and end dates.';
            return;
        }  

        try {
            const resp = await fetch(`/api/performance?start=${start}&end=${end}`, { credentials: 'include' });
            const json = await resp.json();
            if (!json.success) {
                errorBox.textContent = json.error || 'Failed to load data.';
                return;
            }
            const byPage = json.data.byPage || [];
            renderCards(byPage);
            renderTable(byPage);
        } catch (err) {
            errorBox.textContent = 'Network error: could not reach API.';
            console.error(err);
        }
    }


    return { createReportPage, init };
})();
