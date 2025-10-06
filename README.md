# MOE Expert Collaboration Mining

This is an implementation for our research paper "Unveiling Hidden Collaboration Patterns in Mixture-of-Experts Models" based on Python and web technologies.

## Abstract

This project presents a comprehensive framework for analyzing and visualizing expert collaboration patterns in Mixture-of-Experts (MOE) models. We introduce novel methodologies for expert focus analysis, activation pattern mining, and multi-level expert decomposition, providing insights into the hidden collaboration mechanisms that drive MOE model performance.

## Requirements

* Python 3.7+
* Node.js 14+
* Flask, Flask-CORS
* NumPy, Pandas, Matplotlib
* Axios (for HTTP requests)

## Project Structure

```
MOE-EXPERTS-Collaboration/
├── visualization_website/     # Interactive web visualization platform
├── paper_implementation/     # Research code and analysis scripts
└── README.md                # This file
```

## Datasets

### Expert Activation Patterns
* **DeepSeek-MoE-16B**: https://huggingface.co/deepseek-ai/DeepSeek-MoE-16B
* **PhiMOE**: https://huggingface.co/microsoft/Phi-3-medium-128k-instruct
* **MMLU-pro322**: Custom dataset covering five domains: mathematics, computer science, physics, law, and psychology
* **Format**: JSON files containing expert activation sequences
* **Preprocessing**: Token-level activation extraction and normalization

## Quick Start

### Interactive Visualization Platform

```bash
cd visualization_website
pip install -r requirements.txt
npm install
python app.py & npx http-server -p 8080
```

Then open `http://localhost:8080` in your browser.

### Dictionary Learning Algorithm

```bash
cd paper_implementation
python expert_analysis.py
```

## Parameters

Key parameters in the analysis pipeline:

* `--expert_threshold`: Minimum activation threshold for expert selection (default: 0.1)
* `--focus_weight`: Weight for focus score calculation (default: 0.5)
* `--network_size`: MOE network dimensions (default: 64x27)
* `--analysis_depth`: Maximum decomposition depth (default: 2)

## License

This project is licensed under the MIT License.

---

*This work was completed as part of our research on MOE model analysis and visualization.*
