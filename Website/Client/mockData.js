export const mockCases = [
  {
    id: 1,
    title: "Wrongful Termination Case",
    client: "John Doe",
    status: "Active",
    caseAnalysis: {
      key_issues: [
        "Wrongful termination of employment",
        "Violation of labor laws",
        "Entitlement to compensation for wrongful termination",
        "Due process and notice period in employment termination",
        "Interpretation of employment contract",
      ],
      keywords: [
        "Termination notice",
        "Wrongful termination",
        "Labor laws",
        "Employment contract",
        "Due process",
        "Compensation",
        "Labor tribunal",
        "Court",
        "Loss of income",
        "Damages",
      ],
      laws_cited: ["The Industrial Disputes Act, 1947", "The Contract Act, 1872", "Specific state labor laws"],
      recommendations: [
        "Gather all relevant documentation: employment contract, termination letter, payslips, performance reviews, etc.",
        "Consult with a labor lawyer specializing in employment law to thoroughly review the employment contract and assess the strength of the case.",
        "Determine if the termination was in compliance with the applicable Industrial Disputes Act, 1947 and other relevant state labor laws.",
        "If grounds for wrongful termination exist, file a complaint with the appropriate labor tribunal or initiate legal proceedings in a civil court for compensation and other remedies.",
        "Seek legal advice on the potential quantum of compensation, taking into account loss of income, potential future earnings, and other damages.",
      ],
      summary:
        "The conversation centers on a client's wrongful termination from employment without prior notice or adherence to due process as stipulated by the contract or relevant labor laws. The lawyer advises that the client may be entitled to compensation for loss of income and damages if they can prove wrongful termination. Legal recourse via a labor tribunal or court is suggested.",
    },
    relatedCases: [
      {
        keyword: "Wrongful termination",
        cases: [
          {
            href: "https://indiankanoon.org/doc/25402450/",
            text: "Fidelity Management & Research Co. vs Department Of Income Tax on 2 September, 6648",
          },
          {
            href: "https://indiankanoon.org/doc/76122250/",
            text: "State vs 1.Tannu Chawla on 25 January, 2025",
          },
          {
            href: "https://indiankanoon.org/doc/85951597/",
            text: "Kamal Kumar Aggarwala vs M/S Capital Trade Links Limited on 25 January, 2025",
          },
        ],
      },
      // Add more related cases here...
    ],
    classifiedContent: [
      {
        classified_content: {
          facts: "Employee terminated without notice",
          issues: "Wrongful termination, violation of labor laws",
          arguments: "Termination violated employment contract and labor laws",
          conclusions: "Employee may be entitled to compensation",
        },
        href: "https://indiankanoon.org/doc/111377338/",
        keyword: "Employment contract",
      },
    ],
  },
]

