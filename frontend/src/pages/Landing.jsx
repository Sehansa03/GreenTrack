
import { Link } from "react-router-dom";
import "./Landing.css";

const features = [
  {
    icon: "↗",
    title: "Income tracking",
    description:
      "Keep your income sources and financial records organized in one place.",
  },
  {
    icon: "↘",
    title: "Expense management",
    description:
      "Record expenses and understand where your money goes.",
  },
  {
    icon: "◉",
    title: "Visual analytics",
    description:
      "Explore financial trends and spending patterns with clear charts.",
  },
  {
    icon: "▤",
    title: "Budget planning",
    description:
      "Create budgets and compare spending with your financial plans.",
  },
  {
    icon: "⇄",
    title: "Multiple currencies",
    description:
      "Track transactions in different currencies and view converted totals.",
  },
  {
    icon: "▥",
    title: "Financial reports",
    description:
      "Review your income, expenses, and overall financial activity.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create an account",
    description:
      "Sign up and select your country and preferred currency.",
  },
  {
    number: "02",
    title: "Record transactions",
    description:
      "Add income and expenses whenever they happen.",
  },
  {
    number: "03",
    title: "Explore insights",
    description:
      "Use your dashboard, analytics, budgets, and reports.",
  },
];

const chartData = [
  { month: "Jun", income: 50, expense: 32 },
  { month: "Jul", income: 68, expense: 40 },
  { month: "Aug", income: 58, expense: 37 },
  { month: "Sep", income: 78, expense: 49 },
  { month: "Oct", income: 70, expense: 35 },
  { month: "Nov", income: 90, expense: 45 },
];

function SproutPreview() {
  return (
    <div className="gt-preview-sprout">
      <div className="gt-preview-sprout-avatar">
        <svg
          viewBox="0 0 64 64"
          width="38"
          height="38"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M32 51V28"
            stroke="#35B978"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M31 33C19 33 13 26 13 16C24 16 31 22 31 33Z"
            fill="#35B978"
          />
          <path
            d="M33 29C33 18 40 12 51 12C51 23 44 29 33 29Z"
            fill="#93E9BE"
          />
          <circle cx="27" cy="43" r="2" fill="#F2F5F3" />
          <circle cx="37" cy="43" r="2" fill="#F2F5F3" />
          <path
            d="M28 48C30 51 34 51 36 48"
            stroke="#F2F5F3"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="gt-preview-sprout-content">
        <span>SPROUT · YOUR FINANCIAL COMPANION</span>
        <strong>
          Every financial journey starts with one step.
        </strong>
        <p>
          Track your progress and build better money habits.
        </p>
      </div>
    </div>
  );
}

function DashboardPreview() {
  const stats = [
    {
      label: "Total income",
      value: "LKR 150,000",
      description: "Money received",
      icon: "↙",
    },
    {
      label: "Total expenses",
      value: "LKR 65,000",
      description: "Money spent",
      icon: "↗",
    },
    {
      label: "Balance",
      value: "LKR 85,000",
      description: "Income minus expenses",
      icon: "◇",
    },
  ];

  return (
    <div className="gt-preview">
      <div className="gt-preview-top">
        <div className="gt-preview-dots">
          <i />
          <i />
          <i />
        </div>

        <span>GreenTrack / Dashboard preview</span>

        <span className="gt-preview-demo">
          Sample data
        </span>
      </div>

      <div className="gt-preview-body">
        <div className="gt-preview-heading">
          <div>
            <span className="gt-preview-kicker">
              YOUR FINANCIAL OVERVIEW
            </span>

            <h3>Your finances at a glance</h3>

            <p>
              A simpler way to understand your money.
            </p>
          </div>

          <div
            className="gt-preview-add-icon"
            aria-hidden="true"
          >
            +
          </div>
        </div>

        <SproutPreview />

        <div className="gt-preview-stats">
          {stats.map((stat) => (
            <div className="gt-preview-stat" key={stat.label}>
              <div className="gt-preview-stat-top">
                <span>{stat.label}</span>
                <span className="gt-preview-stat-icon">
                  {stat.icon}
                </span>
              </div>

              <strong>{stat.value}</strong>
              <small>{stat.description}</small>
            </div>
          ))}
        </div>

        <div className="gt-preview-chart">
          <div className="gt-chart-heading">
            <div>
              <strong>Income & spending</strong>
              <p>Illustrative monthly activity</p>
            </div>

            <span>Last 6 months</span>
          </div>

          <div className="gt-chart-bars">
            {chartData.map((item) => (
              <div
                className="gt-chart-group"
                key={item.month}
              >
                <div className="gt-chart-pair">
                  <div
                    className="gt-bar-income"
                    style={{
                      height: `${item.income}%`,
                    }}
                  />
                  <div
                    className="gt-bar-expense"
                    style={{
                      height: `${item.expense}%`,
                    }}
                  />
                </div>

                <span>{item.month}</span>
              </div>
            ))}
          </div>

          <div className="gt-chart-legend">
            <span>
              <i className="gt-legend-income" />
              Income
            </span>

            <span>
              <i className="gt-legend-expense" />
              Expenses
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <main className="gt-landing">
      {/* HERO */}
      <section className="gt-hero">
        <div className="gt-hero-glow" />

        <div className="gt-hero-content">
          <div className="gt-eyebrow">
            <span className="gt-status-dot" />
            A clearer way to manage your money
          </div>

          <h1>
            Take control of your money.
            <span> Grow with confidence.</span>
          </h1>

          <p className="gt-hero-description">
            Track income, manage expenses, plan budgets,
            and understand your finances with GreenTrack —
            your personal finance companion.
          </p>

          <div className="gt-hero-actions">
            <Link
              to="/register"
              className="gt-landing-primary"
            >
              Get started free
              <span aria-hidden="true">→</span>
            </Link>

            <a
              href="#features"
              className="gt-landing-secondary"
            >
              Explore features
            </a>
          </div>

          <div className="gt-hero-note">
            <span>✓ Simple tracking</span>
            <span>✓ Multiple currencies</span>
            <span>✓ Clear insights</span>
          </div>
        </div>

        <DashboardPreview />
      </section>

      {/* FEATURES */}
      <section
        className="gt-feature-section"
        id="features"
      >
        <div className="gt-section-heading">
          <span className="gt-section-label">
            WHAT GREENTRACK OFFERS
          </span>

          <h2>
            Everything you need to stay financially
            organized.
          </h2>

          <p>
            Practical tools designed to make everyday
            money management simpler and easier
            to understand.
          </p>
        </div>

        <div className="gt-features-grid">
          {features.map((feature) => (
            <article
              className="gt-feature-card"
              key={feature.title}
            >
              <div className="gt-feature-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="gt-steps-section"
        id="how-it-works"
      >
        <div className="gt-section-heading">
          <span className="gt-section-label">
            GETTING STARTED
          </span>

          <h2>
            Three simple steps to better financial clarity.
          </h2>

          <p>
            Start tracking your finances without
            unnecessary complexity.
          </p>
        </div>

        <div className="gt-steps-grid">
          {steps.map((step) => (
            <article
              className="gt-step-card"
              key={step.number}
            >
              <span className="gt-step-number">
                {step.number}
              </span>

              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section
        className="gt-about-section"
        id="about"
      >
        <div className="gt-about-content">
          <span className="gt-section-label">
            ABOUT GREENTRACK
          </span>

          <h2>
            Built to make personal finance feel simpler.
          </h2>

          <p>
            GreenTrack brings your transactions, budgets,
            analytics, and reports into one organized
            workspace so you can focus on understanding
            your financial progress.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="gt-final-section">
        <div className="gt-final-card">
          <span className="gt-section-label">
            YOUR FINANCIAL JOURNEY
          </span>

          <h2>
            Start making sense of your money today.
          </h2>

          <p>
            Take the first step toward organized finances
            with GreenTrack.
          </p>

          <Link
            to="/register"
            className="gt-landing-primary"
          >
            Create your account →
          </Link>
        </div>
      </section>
    </main>
  );
}
