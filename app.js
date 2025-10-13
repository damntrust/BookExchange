(function () {
  const form = document.getElementById('sipSwpForm');
  const calculateBtn = document.getElementById('calculateBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultsCard = document.getElementById('results');
  const corpusLine = document.getElementById('corpusLine');
  const payoutLine = document.getElementById('payoutLine');

  function formatINR(amountInteger) {
    return '₹ ' + Number(amountInteger).toLocaleString('en-IN');
  }

  function clearInvalid(input) {
    input.setAttribute('aria-invalid', 'false');
  }

  function markInvalid(input) {
    input.setAttribute('aria-invalid', 'true');
  }

  function validate() {
    const sipAmountEl = document.getElementById('sipAmount');
    const sipYearsEl = document.getElementById('sipYears');
    const withdrawYearsEl = document.getElementById('withdrawYears');
    const sipReturnEl = document.getElementById('sipReturn');
    const withdrawReturnEl = document.getElementById('withdrawReturn');

    // reset invalid states
    [sipAmountEl, sipYearsEl, withdrawYearsEl, sipReturnEl, withdrawReturnEl].forEach(clearInvalid);

    const sipAmount = Number(sipAmountEl.value);
    const sipYears = Number(sipYearsEl.value);
    const withdrawYears = Number(withdrawYearsEl.value);
    const sipReturn = Number(sipReturnEl.value);
    const withdrawReturn = Number(withdrawReturnEl.value);

    if (!Number.isFinite(sipAmount) || sipAmount <= 0) {
      markInvalid(sipAmountEl);
      alert('Please enter a valid Monthly SIP Amount greater than 0.');
      return null;
    }

    if (!Number.isInteger(sipYears) || sipYears <= 0) {
      markInvalid(sipYearsEl);
      alert('Please enter a whole number for SIP Period (Years) greater than 0.');
      return null;
    }

    if (!Number.isInteger(withdrawYears) || withdrawYears <= 0) {
      markInvalid(withdrawYearsEl);
      alert('Please enter a whole number for Withdrawal Period (Years) greater than 0.');
      return null;
    }

    if (!Number.isFinite(sipReturn) || sipReturn < 0 || sipReturn > 100) {
      markInvalid(sipReturnEl);
      alert('Please enter a valid SIP Return between 0 and 100.');
      return null;
    }

    if (!Number.isFinite(withdrawReturn) || withdrawReturn < 0 || withdrawReturn > 100) {
      markInvalid(withdrawReturnEl);
      alert('Please enter a valid Withdrawal Return between 0 and 100.');
      return null;
    }

    return { sipAmount, sipYears, withdrawYears, sipReturn, withdrawReturn };
  }

  function computeCorpusAndPayout(inputs) {
    const { sipAmount, sipYears, withdrawYears, sipReturn, withdrawReturn } = inputs;

    const months = sipYears * 12;
    const sipMonthlyRate = Math.pow(1 + sipReturn / 100, 1 / 12) - 1; // effective monthly

    let corpus;
    if (sipMonthlyRate === 0) {
      corpus = sipAmount * months; // no interest; sum of deposits
    } else {
      // annuity-due FV: P * ((1+i)^(n+1) - (1+i)) / i
      corpus = sipAmount * ((Math.pow(1 + sipMonthlyRate, months + 1) - (1 + sipMonthlyRate)) / sipMonthlyRate);
    }

    const withdrawMonths = withdrawYears * 12;
    const withdrawMonthlyRate = Math.pow(1 + withdrawReturn / 100, 1 / 12) - 1;

    let payout;
    if (withdrawMonthlyRate === 0) {
      payout = corpus / withdrawMonths;
    } else {
      // level SWP: PMT = FV * i / (1 - (1+i)^-n)
      payout = corpus * withdrawMonthlyRate / (1 - Math.pow(1 + withdrawMonthlyRate, -withdrawMonths));
    }

    const corpusRounded = Math.round(corpus);
    const payoutRounded = Math.round(payout);

    return { corpusRounded, payoutRounded };
  }

  function renderResults(inputs, outputs) {
    const { sipYears, withdrawYears } = inputs;
    const { corpusRounded, payoutRounded } = outputs;

    corpusLine.textContent = `Your Accumulated Corpus will be ${formatINR(corpusRounded)} after ${sipYears} years`;
    payoutLine.textContent = `You will receive ${formatINR(payoutRounded)} Monthly for ${withdrawYears} years`;
    resultsCard.classList.remove('hidden');
  }

  function handleCalculate() {
    const inputs = validate();
    if (!inputs) return;

    const outputs = computeCorpusAndPayout(inputs);
    renderResults(inputs, outputs);
  }

  function handleReset() {
    form.reset();
    // clear invalid visuals
    ['sipAmount','sipYears','withdrawYears','sipReturn','withdrawReturn']
      .map(id => document.getElementById(id))
      .forEach(el => el && el.setAttribute('aria-invalid', 'false'));

    // hide and clear results
    corpusLine.textContent = '';
    payoutLine.textContent = '';
    resultsCard.classList.add('hidden');
  }

  calculateBtn.addEventListener('click', handleCalculate);
  resetBtn.addEventListener('click', handleReset);

  // remove invalid highlight on input change
  ['sipAmount','sipYears','withdrawYears','sipReturn','withdrawReturn']
    .forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener('input', () => clearInvalid(el));
    });
})();
