/* ============================================
   Computer Solutions - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- Mobile Navigation Toggle ---
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      const spans = mobileToggle.querySelectorAll('span');
      if (navLinks.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      });
    });
  }

  // --- Contact Modal ---
  var contactModal = document.getElementById('contactModal');
  var contactModalClose = document.getElementById('contactModalClose');
  var modalContactForm = document.getElementById('modalContactForm');
  var modalContactSuccess = document.getElementById('modalContactSuccess');

  if (contactModal) {
    // Open modal on any [data-open-contact] click
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-open-contact]');
      if (!trigger) return;
      e.preventDefault();

      // If coming from troubleshooter, attach chat transcript
      var mcMessage = document.getElementById('mcMessage');
      if (trigger.hasAttribute('data-include-chat') && tsMessages && mcMessage) {
        var msgs = tsMessages.querySelectorAll('.ts-msg');
        var lines = [];
        msgs.forEach(function (m) {
          var who = m.classList.contains('user') ? 'Customer' : 'Robo Chaiyz';
          lines.push(who + ': ' + m.textContent.replace('Schedule a visit →', '').trim());
        });
        mcMessage.value = '--- Troubleshooting Chat ---\n' + lines.join('\n');
      }

      contactModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    // Close
    contactModalClose.addEventListener('click', function () {
      contactModal.classList.remove('open');
      document.body.style.overflow = '';
    });

    contactModal.addEventListener('click', function (e) {
      if (e.target === contactModal) {
        contactModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && contactModal.classList.contains('open')) {
        contactModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Submit via Web3Forms
    if (modalContactForm && modalContactSuccess) {
      submitWeb3Form(modalContactForm, modalContactSuccess);
    }
  }

  // --- Services showcase ---
  var svcData = [
    { title: 'PC & Laptop Repair', desc: 'Complete hardware and software repair for desktops and laptops. Screen replacements, motherboard repair, component upgrades, and more. All major brands and models serviced.' },
    { title: 'Virus & Malware Removal', desc: 'Thorough virus and malware removal with a 90-day warranty. We clean your system, set up protection, and if it comes back within 90 days we fix it free.' },
    { title: 'Data Recovery', desc: 'Lost important files? We recover data from damaged, corrupted, or failing hard drives and SSDs. Don\'t panic — bring it in and we\'ll see what we can save.' },
    { title: 'Computer Sales', desc: 'New and refurbished laptops and desktops at competitive prices. We help you find the right computer for your needs and budget, with setup included.' },
    { title: 'Business IT Support', desc: 'Full software and hardware support for business computers. Consulting, setup, network troubleshooting, and ongoing maintenance plans available.' }
  ];

  var svcIcons = document.getElementById('svcIcons');
  var svcDetailInner = document.getElementById('svcDetailInner');

  function showService(index) {
    var s = svcData[index];
    svcDetailInner.innerHTML = '<h3>' + s.title + '</h3><p>' + s.desc + '</p><a href="services.html">Learn more &rarr;</a>';
    svcDetailInner.style.animation = 'none';
    svcDetailInner.offsetHeight; // trigger reflow
    svcDetailInner.style.animation = 'svcFadeIn 0.35s ease';
  }

  if (svcIcons && svcDetailInner) {
    showService(0);
    var autoRotate = setInterval(function () {
      var current = svcIcons.querySelector('.svc-icon-btn.active');
      var next = current.nextElementSibling;
      if (!next || !next.classList.contains('svc-icon-btn')) {
        next = svcIcons.querySelector('.svc-icon-btn');
      }
      svcIcons.querySelectorAll('.svc-icon-btn').forEach(function (b) { b.classList.remove('active'); });
      next.classList.add('active');
      showService(parseInt(next.getAttribute('data-index')));
    }, 5000);

    function activateService(btn) {
      clearInterval(autoRotate);
      svcIcons.querySelectorAll('.svc-icon-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      showService(parseInt(btn.getAttribute('data-index')));
    }

    svcIcons.addEventListener('click', function (e) {
      var btn = e.target.closest('.svc-icon-btn');
      if (btn) activateService(btn);
    });

    svcIcons.addEventListener('mouseover', function (e) {
      var btn = e.target.closest('.svc-icon-btn');
      if (btn) activateService(btn);
    });
  }

  // --- Header scroll effect ---
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- Scroll-triggered fade-in animations ---
  const fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length > 0) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- Contact Form Submission ---
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');

  if (contactForm && contactSuccess) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      var valid = true;
      contactForm.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) return;

      // Simulate submission
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(function () {
        contactForm.style.display = 'none';
        contactSuccess.classList.add('show');
      }, 1200);
    });
  }

  // --- Booking Form Submission ---
  const bookingForm = document.getElementById('bookingForm');
  const bookingSuccess = document.getElementById('bookingSuccess');

  if (bookingForm && bookingSuccess) {
    // Set minimum date to today
    var dateInput = document.getElementById('bookDate');
    if (dateInput) {
      var today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      bookingForm.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) return;

      var submitBtn = bookingForm.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Booking...';
      submitBtn.disabled = true;

      setTimeout(function () {
        bookingForm.style.display = 'none';
        bookingSuccess.classList.add('show');
      }, 1200);
    });
  }

  // --- Input validation feedback ---
  document.querySelectorAll('input[required], textarea[required], select[required]').forEach(function (field) {
    field.addEventListener('blur', function () {
      if (!this.value.trim()) {
        this.style.borderColor = '#ef4444';
      } else {
        this.style.borderColor = '#10b981';
      }
    });

    field.addEventListener('input', function () {
      if (this.value.trim()) {
        this.style.borderColor = '#10b981';
      }
    });
  });

  // --- Inject Web3Forms key from config.js ---
  if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.WEB3FORMS_KEY) {
    document.querySelectorAll('.web3forms-key').forEach(function (el) {
      el.value = SITE_CONFIG.WEB3FORMS_KEY;
    });
  }

  // --- Web3Forms submission helper ---
  function submitWeb3Form(form, successEl) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      if (!valid) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      var formData = new FormData(form);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          form.style.display = 'none';
          successEl.classList.add('show');
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      })
      .catch(function (err) {
        console.warn('Web3Forms error:', err.message);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        // Show fallback
        alert('Message could not be sent. Please call us at (352) 478-6519 or email chaiyz@att.net');
      });
    });
  }

  // --- Home Contact Form (Web3Forms) ---
  var homeContactForm = document.getElementById('homeContactForm');
  var homeContactSuccess = document.getElementById('homeContactSuccess');
  if (homeContactForm && homeContactSuccess) {
    submitWeb3Form(homeContactForm, homeContactSuccess);
  }

  // --- Home Callback Form (Web3Forms) ---
  var homeCallbackForm = document.getElementById('homeCallbackForm');
  var homeCallbackSuccess = document.getElementById('homeCallbackSuccess');
  if (homeCallbackForm && homeCallbackSuccess) {
    // Set min date to today
    var cbDateInput = document.getElementById('cbDate');
    if (cbDateInput) {
      var todayStr = new Date().toISOString().split('T')[0];
      cbDateInput.setAttribute('min', todayStr);
    }
    submitWeb3Form(homeCallbackForm, homeCallbackSuccess);
  }

  // --- Robo Chaiyz modal open ---
  var roboOpenBtn = document.getElementById('roboOpenBtn');
  var tsModal = document.getElementById('tsModal');
  var tsModalClose = document.getElementById('tsModalClose');

  if (roboOpenBtn && tsModal) {
    roboOpenBtn.addEventListener('click', function () {
      tsModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      var inp = document.getElementById('tsInput');
      if (inp) inp.focus();
    });

    tsModalClose.addEventListener('click', function () {
      tsModal.classList.remove('open');
      document.body.style.overflow = '';
    });

    tsModal.addEventListener('click', function (e) {
      if (e.target === tsModal) {
        tsModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // --- Troubleshooter ---
  var tsForm = document.getElementById('tsForm');
  var tsInput = document.getElementById('tsInput');
  var tsMessages = document.getElementById('tsMessages');
  var tsQuick = document.getElementById('tsQuick');
  var tsHistory = [];

  function tsAddMsg(text, sender) {
    var div = document.createElement('div');
    div.className = 'ts-msg ' + sender;
    var html = text.replace(/\n/g, '<br>');
    // Add "Schedule a visit" link to bot messages that mention scheduling/booking/visit/come in
    if (sender === 'bot') {
      html = '<img src="images/bio.jpg" alt="Robo Chaiyz" class="ts-avatar">' + html;
      if (/schedul|book|visit|come in|bring it|hands-on|in.person|free diagnostic/i.test(text)) {
        html += '<br><a class="ts-book-link" data-open-contact data-include-chat href="#">Schedule a visit &rarr;</a>';
      }
    }
    div.innerHTML = html;
    tsMessages.appendChild(div);
    tsMessages.scrollTop = tsMessages.scrollHeight;
  }

  function tsShowTyping() {
    var div = document.createElement('div');
    div.className = 'ts-typing';
    div.id = 'tsTyping';
    div.innerHTML = '<span></span><span></span><span></span>';
    tsMessages.appendChild(div);
    tsMessages.scrollTop = tsMessages.scrollHeight;
  }

  function tsRemoveTyping() {
    var el = document.getElementById('tsTyping');
    if (el) el.remove();
  }

  async function tsSend(text) {
    if (!text.trim()) return;
    tsAddMsg(text, 'user');
    if (tsQuick) tsQuick.style.display = 'none';
    tsInput.value = '';
    tsInput.disabled = true;

    tsHistory.push({ role: 'user', content: text });
    tsShowTyping();

    try {
      var res = await fetch('/api/troubleshoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: tsHistory.slice(-12) })
      });

      if (!res.ok) throw new Error(res.status);
      var data = await res.json();
      var reply = data.reply;
      tsHistory.push({ role: 'assistant', content: reply });
      tsRemoveTyping();
      tsAddMsg(reply, 'bot');
      tsCheckShowSend();
    } catch (err) {
      tsRemoveTyping();
      tsAddMsg('I\'m having trouble connecting right now. Please call us at (352) 478-6519 for immediate help!', 'bot');
    }

    tsInput.disabled = false;
    tsInput.focus();
  }

  if (tsForm) {
    tsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      tsSend(tsInput.value);
    });
  }

  if (tsQuick) {
    tsQuick.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (btn) tsSend(btn.getAttribute('data-msg'));
    });
  }

  // --- Troubleshooter: Send Chat ---
  var tsSendChat = document.getElementById('tsSendChat');
  var tsSendChatBtn = document.getElementById('tsSendChatBtn');
  var tsChatModal = document.getElementById('tsChatModal');
  var tsChatModalClose = document.getElementById('tsChatModalClose');
  var tsChatForm = document.getElementById('tsChatForm');
  var tsChatSuccess = document.getElementById('tsChatSuccess');
  var tsChatTranscript = document.getElementById('tsChatTranscript');
  var tsExchangeCount = 0;

  // Show "send chat" button after 2 bot replies
  function tsCheckShowSend() {
    tsExchangeCount++;
    if (tsExchangeCount >= 2 && tsSendChat) {
      tsSendChat.style.display = 'block';
    }
  }

  // Patch tsSend to count exchanges
  var _origTsSend = typeof tsSend === 'function' ? tsSend : null;
  if (_origTsSend) {
    // Already defined above — hook into the reply flow
  }

  if (tsSendChatBtn && tsChatModal) {
    tsSendChatBtn.addEventListener('click', function () {
      // Build transcript from chat messages
      var msgs = tsMessages.querySelectorAll('.ts-msg');
      var transcript = [];
      msgs.forEach(function (m) {
        var who = m.classList.contains('user') ? 'Customer' : 'Tech Assistant';
        transcript.push(who + ': ' + m.textContent.replace('Schedule a visit →', '').trim());
      });
      tsChatTranscript.value = transcript.join('\n\n');
      tsChatModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    tsChatModalClose.addEventListener('click', function () {
      tsChatModal.classList.remove('open');
      document.body.style.overflow = '';
    });

    tsChatModal.addEventListener('click', function (e) {
      if (e.target === tsChatModal) {
        tsChatModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    if (tsChatForm && tsChatSuccess) {
      submitWeb3Form(tsChatForm, tsChatSuccess);
    }
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
