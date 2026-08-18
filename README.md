# TakeHomeCalc

TakeHomeCalc is a static, client-side paycheck calculator for estimating 2026 take-home pay and the incremental take-home value of overtime.

## What is included

- Paycheck calculator with hourly and salary inputs
- Overtime comparison using full paycheck recalculation before and after overtime
- Raise calculator using the same calculation engine
- Federal 2026 withholding using IRS Publication 15-T automated percentage method data
- 2026 employee FICA rules from IRS Publication 15
- All-state selector with federal/FICA and state income-tax estimates for anyone in the United States
- West Virginia 2026 withholding using WV IT-100.2.A percentage method data
- $0 state withholding for states with no wage income tax
- Local-only saved settings
- SEO-oriented static pages and educational resources
- No backend, database, API keys, or paid dependencies

## Run locally

Open `index.html` in a browser, or serve the folder with any static file server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

## Tests

```bash
npm test
```

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Add these files to the repository root.
3. Commit and push to GitHub.
4. In GitHub, open Settings, then Pages.
5. Under Build and deployment, select Deploy from a branch.
6. Choose the main branch and the root folder.
7. Save and wait for GitHub Pages to publish.

For a custom domain later, add the domain in the GitHub Pages settings and configure DNS with your domain provider.

## Known V1 limitations

- State withholding is fully implemented for West Virginia.
- Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming are treated as no wage-income-tax states.
- Other states use 2026 state income tax rate/bracket estimates from Tax Foundation data, not employer-specific withholding tables.
- Local income taxes are not included.
- Local taxes, bonuses, special employer payroll methods, and year-to-date wage history are not fully modeled.
- The calculator estimates withholding, not final annual tax liability.

## Official sources

- IRS Publication 15-T: https://www.irs.gov/publications/p15t
- IRS Publication 15: https://www.irs.gov/publications/p15
- West Virginia withholding forms: https://tax.wv.gov/business/withholding/pages/withholdingtaxforms.aspx
- Tax Foundation 2026 state income tax rates and brackets: https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/
