/* ============================================================
   AS://DATA — single source of truth for portfolio content
   Consumed by: markets.html, forest.html
   ============================================================ */
window.MARKETS = [
  // ---------- FEATURED / TOP ----------
  {
    id:"AS-WORK-NAYYA-2025", category:"career", featured:true, resolved:true,
    cat:"Career", question:"Aadithya engineered production data pipelines at Nayya in 2025.",
    summary:"Apr–Aug 2025 · NYC · Data Analytics / Data Science Intern",
    yes:99, no:1, vol:"$3.4k", traders:42,
    chart:"flat-high",
    detail:{
      criteria:"Resolves YES if measurable production code shipped to Nayya during the Apr–Aug 2025 window. Confirmed by employer reference.",
      desc:"Nayya is a benefits-experience platform processing tens of millions of pharmacy and medical claims for enterprise clients.",
      bullets:[
        "Engineered scalable SQL + Python pipelines processing <strong>100M+</strong> pharmacy/medical claims with Athena, PostgreSQL, dbt — surfacing cost drivers and formulary misalignments.",
        "Automated anomaly detection across millions of rows with Pandas / NumPy, integrating output directly into regulatory reporting flows.",
        "Delivered interactive Sigma dashboards with trend forecasting and variance analysis for executive decision-making."
      ],
      stack:["Python","SQL","Athena","PostgreSQL","dbt","Pandas","NumPy","Sigma"],
      role:"Data Analytics / Data Science Intern",
      when:{start:"Apr 2025", end:"Aug 2025", loc:"New York City"}
    }
  },
  {
    id:"AS-PROJ-EVENTEDGE", category:"builds", featured:true, resolved:true,
    cat:"Build", question:"EventEdge ships and serves at least 50 paying users.",
    summary:"Real-time auto-trading platform · production",
    yes:97, no:3, vol:"$1.9k", traders:31,
    chart:"climb",
    detail:{
      criteria:"Resolves YES on launch + verified user count.",
      desc:"End-to-end prediction-market trading system. Pulls live odds, computes win-probability estimates from historical and contextual features, compares against Kalshi contract prices every 3 seconds, and executes trades automatically across NBA, MLB, CBB, WCBB, NHL, soccer, and tennis markets.",
      bullets:[
        "<strong>50+</strong> active users across 7 sports verticals.",
        "<strong>3-second</strong> trading loop — odds → model → comparison → trade.",
        "RSA-PSS signed payloads; full Stripe billing layer; deployed on Railway."
      ],
      stack:["Python","Next.js","Supabase","Railway","Stripe","RSA-PSS"],
      url:"https://eventedgehq.com"
    }
  },
  {
    id:"AS-CHESS-2300", category:"hobby", featured:true, resolved:true,
    cat:"Hobby", question:"Aadithya holds a 2300+ rating on Chess.com (top 1%).",
    summary:"Tournament chess · 99th percentile global",
    yes:100, no:0, vol:"$2.1k", traders:19,
    chart:"steady",
    detail:{
      criteria:"Resolves YES on confirmed Chess.com rating ≥ 2300 (any time control).",
      desc:"Tournament-level classical and rapid play. Strongest in quiet positional games where one tempo decides the endgame. Consistent 99th-percentile finish in club events; the endgame study is what most informs my approach to engineering — make the position you want, then convert.",
      bullets:[
        "Peak rating: <strong>2300+</strong> · top 1% on Chess.com.",
        "Active in tournament play, classical and rapid.",
        "Inspired the homemade <strong>Chess Engine</strong> project — see Build markets."
      ]
    }
  },

  // ---------- CAREER ----------
  {
    id:"AS-WORK-ARISTOTLE-2023", category:"career", resolved:true,
    cat:"Career", question:"Aadithya shipped AI-driven backend services at Aristotle in 2023.",
    summary:"Jun–Sep 2023 · Remote · SWE Intern",
    yes:99, no:1, vol:"$0.9k", traders:18,
    chart:"climb",
    detail:{
      desc:"Aristotle — Your AI SDR. AI-driven outbound sales platform.",
      role:"Software Engineer Intern",
      when:{start:"Jun 2023", end:"Sep 2023", loc:"Remote"},
      bullets:[
        "Prototyped generative-adversarial persona models; deployed AI-driven backend services in TypeScript, Python, and AWS.",
        "Integrated NLP API features and optimized lead-matching pipeline — <strong>cut latency 20%</strong> and improved demo conversion."
      ],
      stack:["TypeScript","Python","AWS","NLP","GAN"],
      criteria:"Resolves YES on confirmed employment + shipped service."
    }
  },
  {
    id:"AS-WORK-NJIT-2023", category:"career", resolved:true,
    cat:"Career", question:"Aadithya conducted ML research at NJIT HSSRI and presented findings.",
    summary:"Jun–Aug 2023 · Newark · Research Intern",
    yes:99, no:1, vol:"$0.7k", traders:14,
    chart:"steady",
    detail:{
      desc:"NJIT — Hillier School / HSSRI. Computational visual perception lab.",
      role:"Student Research Intern",
      when:{start:"Jun 2023", end:"Aug 2023", loc:"Newark, NJ"},
      bullets:[
        "Computational modeling of visual perception systems with TensorFlow, scikit-learn, and PsychoPy.",
        "Designed and evaluated ML models on experimental datasets; presented findings at the <strong>NJIT Research Symposium</strong>."
      ],
      stack:["TensorFlow","scikit-learn","PsychoPy","Statistics"],
      criteria:"Resolves YES on documented presentation + supervisor reference."
    }
  },

  // ---------- BUILDS ----------
  {
    id:"AS-PROJ-HARBOROS", category:"builds", resolved:true,
    cat:"Build", question:"HarborOS detects maritime threats from live AIS telemetry.",
    summary:"Maritime defense · live WebSocket telemetry",
    yes:96, no:4, vol:"$0.8k", traders:11,
    chart:"climb",
    detail:{
      desc:"Real-time maritime defense system ingesting live AIS vessel telemetry over WebSocket, running 11 heuristic anomaly detectors in parallel, and surfacing operator-actionable alerts with composite risk scoring.",
      bullets:[
        "<strong>11 heuristic detectors</strong> for spoofing, loitering, dark activity, port deviation, and more.",
        "Composite risk score per vessel; alerts threaded into operator console.",
        "Live map render on MapLibre GL with WebSocket-driven track updates."
      ],
      stack:["Next.js","React","MapLibre GL","FastAPI","Python","WebSocket"],
      private: true,
      criteria:"Resolves YES on demoed working prototype."
    }
  },
  {
    id:"AS-PROJ-CHESS-ENGINE", category:"builds", resolved:true,
    cat:"Build", question:"The chess engine evaluates positions with a custom NNUE network.",
    summary:"C++ engine · PyTorch NNUE · web analyzer",
    yes:98, no:2, vol:"$0.6k", traders:9,
    chart:"climb",
    detail:{
      desc:"Full-stack chess engine speaking the UCI protocol, with a PyTorch-trained NNUE evaluator (768→512→1, HalfKP feature representation), and a web-based analysis interface streaming principal variations live.",
      bullets:[
        "<strong>NNUE 768→512→1</strong> with HalfKP features.",
        "UCI engine in modern C++20 with bitboard move generation.",
        "FastAPI bridge + React 18 analyzer with live PV streaming via WebSocket; PostgreSQL + Redis backing store."
      ],
      stack:["C++20","PyTorch","React 18","FastAPI","PostgreSQL","Redis","NNUE"],
      url:"https://github.com/asrinivasan75/chess-engine",
      criteria:"Resolves YES on public repo + working evaluator."
    }
  },
  {
    id:"AS-PROJ-SUPP", category:"builds", resolved:true,
    cat:"Build", question:"Supplement Tracker improves user habit compliance ≥ 15%.",
    summary:"AI recommendation SaaS · adherence analytics",
    yes:94, no:6, vol:"$0.5k", traders:8,
    chart:"climb",
    detail:{
      desc:"Full-stack personalized supplement tracking with AI-driven recommendations, compliance monitoring, and adherence analytics.",
      bullets:[
        "<strong>20% improvement</strong> in habit compliance among test users.",
        "OpenAI-backed recommendation engine; React 19 frontend; MongoDB store.",
        "Reminder system + streak tracking with daily check-ins."
      ],
      stack:["Node.js","React 19","MongoDB","OpenAI API","Tailwind"],
      url:"https://github.com/asrinivasan75/supplement-tracker",
      criteria:"Resolves YES at ≥15% measured improvement; resolved at 20%."
    }
  },
  {
    id:"AS-PROJ-POKERBOT", category:"builds", resolved:true,
    cat:"Build", question:"PokerBot makes profitable decisions via reinforcement learning.",
    summary:"RL agent · Q-learning + policy gradient",
    yes:91, no:9, vol:"$0.3k", traders:6,
    chart:"choppy",
    detail:{
      desc:"Intelligent PokerBot using reinforcement learning with Q-learning and policy gradient methods for strategic call, raise, and fold decisions.",
      bullets:[
        "Q-learning baseline + policy-gradient agent; OpenAI Gym wrapper around a custom poker environment.",
        "Trained against scripted opponents and self-play.",
        "Exploration-rate scheduling and reward shaping."
      ],
      stack:["Python","Keras","NumPy","OpenAI Gym","Q-Learning"],
      url:"https://github.com/asrinivasan75/PokerBot",
      criteria:"Resolves YES on positive expected value vs scripted opponents."
    }
  },
  {
    id:"AS-PROJ-STOCK", category:"builds", resolved:true,
    cat:"Build", question:"Stock-prediction model achieves ≥ 80% directional accuracy.",
    summary:"LSTM / GRU / RF / XGBoost comparison",
    yes:95, no:5, vol:"$0.4k", traders:7,
    chart:"climb",
    detail:{
      desc:"Comprehensive ML system comparing LSTM, GRU, Random Forest, and XGBoost for stock price prediction, with hyperparameter optimization across all four model classes.",
      bullets:[
        "<strong>85%+ accuracy</strong> after hyperparameter tuning.",
        "Side-by-side evaluation harness across LSTM, GRU, Random Forest, XGBoost.",
        "Time-aware train/test split; realistic walk-forward validation."
      ],
      stack:["Python","TensorFlow","scikit-learn","Pandas","XGBoost"],
      url:"https://github.com/asrinivasan75/ML-Based-Stock-Price-Prediction-",
      criteria:"Resolves YES at ≥80% directional accuracy; resolved at 85%."
    }
  },

  // ---------- SKILLS ----------
  {
    id:"AS-SKILL-PY", category:"skills",
    cat:"Skill", question:"Python is in Aadithya's daily working set.",
    summary:"Python · data, ML, backend",
    yes:98, no:2, vol:"$0.2k", traders:13,
    chart:"climb",
    detail:{
      desc:"Daily-driver language across data work (Pandas, NumPy, dbt), ML (PyTorch, TensorFlow, scikit-learn), and backend (FastAPI). Core of EventEdge, Chess Engine training, PokerBot, Stock Prediction, and the Nayya pipelines.",
      bullets:[
        "Production data pipelines processing 100M+ rows.",
        "PyTorch model training; FastAPI service development.",
        "Anomaly detection, regression, classification across multiple stacks."
      ],
      stack:["Python","Pandas","NumPy","PyTorch","TensorFlow","scikit-learn","FastAPI","dbt"]
    }
  },
  {
    id:"AS-SKILL-TS", category:"skills",
    cat:"Skill", question:"TypeScript is in Aadithya's daily working set.",
    summary:"TypeScript · Next.js, Node, full-stack",
    yes:96, no:4, vol:"$0.2k", traders:11,
    chart:"climb",
    detail:{
      desc:"Frontend and backend in TypeScript across React/Next.js work and Node services. Used in EventEdge, HarborOS, Aristotle, Supplement Tracker.",
      bullets:[
        "Next.js production deployments.",
        "Type-safe API contracts between FastAPI/Node services and React frontends.",
        "Realtime WebSocket clients (HarborOS)."
      ],
      stack:["TypeScript","Next.js","React","Node.js","WebSocket"]
    }
  },
  {
    id:"AS-SKILL-CPP", category:"skills",
    cat:"Skill", question:"Aadithya writes performance-critical C++ for engines.",
    summary:"C++20 · engines, bitboards, NNUE",
    yes:88, no:12, vol:"$0.1k", traders:5,
    chart:"choppy",
    detail:{
      desc:"Systems-level C++20 for performance-critical inner loops. Built the chess engine's bitboard move generator and NNUE evaluator.",
      bullets:[
        "Bitboard move generation with magic bitboards.",
        "UCI protocol implementation.",
        "Cache-efficient NNUE inference (HalfKP, 768→512→1)."
      ],
      stack:["C++20","CMake","Bitboards","NNUE"]
    }
  },
  {
    id:"AS-SKILL-ML", category:"skills",
    cat:"Skill", question:"Aadithya trains and evaluates production-grade ML models.",
    summary:"PyTorch / TensorFlow · models in prod",
    yes:94, no:6, vol:"$0.2k", traders:9,
    chart:"climb",
    detail:{
      desc:"Trained models that have shipped or run in evaluation pipelines: NNUE position evaluator, NLP persona models at Aristotle, anomaly detectors at Nayya, perception models at NJIT, time-series ensembles for stock prediction.",
      bullets:[
        "PyTorch (engine) + TensorFlow (research) + scikit-learn (baselines).",
        "Hyperparameter optimization, cross-validation, walk-forward evaluation.",
        "RL with Q-learning + policy gradient (PokerBot)."
      ],
      stack:["PyTorch","TensorFlow","scikit-learn","XGBoost","RL"]
    }
  },
  {
    id:"AS-SKILL-DATA", category:"skills",
    cat:"Skill", question:"Aadithya runs data pipelines at production scale.",
    summary:"SQL · Athena · Postgres · dbt",
    yes:97, no:3, vol:"$0.2k", traders:7,
    chart:"climb",
    detail:{
      desc:"100M+ row pipelines at Nayya. Athena over S3 lakes, PostgreSQL warehouses, dbt for transformation, Pandas for ad-hoc.",
      bullets:[
        "100M+ pharmacy/medical claims processed.",
        "dbt models for cost-driver and formulary analysis.",
        "Sigma dashboards with forecasting and variance analysis."
      ],
      stack:["SQL","Athena","PostgreSQL","dbt","Pandas","Sigma"]
    }
  },

  // ---------- HOBBY ----------
  {
    id:"AS-HOBBY-POKER", category:"hobby", resolved:true,
    cat:"Hobby", question:"Aadithya is active in Penn's Poker Club.",
    summary:"Poker · cash + tournaments",
    yes:100, no:0, vol:"$0.4k", traders:8,
    chart:"steady",
    detail:{
      desc:"Active in Penn's Poker Club. Cash games and tournaments. The goal is to get good at making decisions when the information is intentionally bad — same gym as engineering, different equipment.",
      bullets:[
        "Cash and tournament play.",
        "Inspired the PokerBot RL project.",
        "Intersect of probability, psychology, and bankroll discipline."
      ]
    }
  },
  {
    id:"AS-HOBBY-WITG", category:"hobby", resolved:true,
    cat:"Hobby", question:"Aadithya is a member of the Wharton Investment & Trading Group.",
    summary:"WITG · quantitative track",
    yes:100, no:0, vol:"$0.5k", traders:9,
    chart:"steady",
    detail:{
      desc:"Member of WITG, focused on the quantitative track — equities models, factor research, and event markets. EventEdge lives in this gym.",
      bullets:[
        "Quantitative equity research.",
        "Event-market modeling (carries directly into EventEdge).",
        "Pitch sessions and back-test review."
      ]
    }
  },
  {
    id:"AS-HOBBY-MATH", category:"hobby", resolved:true,
    cat:"Hobby", question:"Aadithya participates in Penn Undergraduate Math Society.",
    summary:"PUMS · combinatorics, probability",
    yes:100, no:0, vol:"$0.2k", traders:5,
    chart:"steady",
    detail:{
      desc:"Penn Undergraduate Math Society member. Combinatorics and probability theory are the favorite rooms in the house.",
      bullets:[
        "Combinatorics and probability seminars.",
        "Problem-solving sessions and competition prep.",
        "Coursework: ML, Algorithms, Big Data Analytics, HCI."
      ]
    }
  },

  // ---------- FUTURE — open contracts ----------
  {
    id:"AS-FUT-INTERN-2026", category:"future",
    cat:"Future", question:"Aadithya secures a Summer 2026 SWE/quant internship at a top firm.",
    summary:"Recruiting cycle · 2026",
    yes:73, no:27, vol:"$1.1k", traders:24,
    chart:"climb",
    detail:{
      desc:"Recruiting target: SWE, quant, or ML role at a top firm for Summer 2026. Open to internships, collaborations, and hard interesting problems.",
      bullets:[
        "Open to: SWE / quant / ML / research engineering roles.",
        "Geographic preference: NYC / SF / remote-friendly.",
        "Strongest fits: trading, fintech, infra, applied ML."
      ],
      criteria:"Resolves YES on signed offer letter for Summer 2026."
    }
  },
  {
    id:"AS-FUT-PROJECT-NEXT", category:"future",
    cat:"Future", question:"Aadithya ships a new public project before EOY 2026.",
    summary:"Cadence bet · ships within 90 days",
    yes:84, no:16, vol:"$0.6k", traders:14,
    chart:"climb",
    detail:{
      desc:"Cadence bet: a new public-facing project ships before end of year. Candidate ideas in the queue include a generalized event-market backtest framework, an open-source NNUE training toolkit, and a real-time options-flow analyzer.",
      bullets:[
        "Track record: 6+ shipped systems in two years.",
        "Bias: small + opinionated + ships > large + perfect + drifts.",
        "Probability calibrated against historical cadence."
      ],
      criteria:"Resolves YES on public repo or live URL by Dec 31, 2026."
    }
  },
  {
    id:"AS-FUT-CHESS-2400", category:"future",
    cat:"Future", question:"Aadithya reaches Chess.com 2400 by EOY 2027.",
    summary:"Long-shot rating climb",
    yes:41, no:59, vol:"$0.3k", traders:11,
    chart:"choppy",
    detail:{
      desc:"Long-shot rating climb. Currently 2300+. Plus-100 in the next 18 months is non-trivial; the market is rightly skeptical.",
      bullets:[
        "Current: <strong>2300+</strong>.",
        "Target: <strong>2400</strong> (FM-equivalent strength).",
        "Plan: tournament practice, endgame study, opening prep."
      ],
      criteria:"Resolves YES on confirmed Chess.com rating ≥ 2400 by Dec 31, 2027."
    }
  }
];
