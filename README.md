# Clarity Protocol

An elite-performance web application delivering structured guidance, content libraries, and premium PDF resources, with full user accounts, cloud sync, and subscription payments.

## Overview

Clarity Protocol is a production web app built on Firebase. It provides authenticated user accounts, real-time data sync, subscription payments, and a library of generated PDF guides. The project includes a complete CI/CD pipeline and production-grade security hardening.

## Features

The app supports user authentication via Firebase Auth and cloud sync through Firestore with offline persistence. Subscription payments are handled with Stripe. A content library of modular guides and PDF resources is generated via a Python build pipeline. Error monitoring is provided by Sentry, and the deployment is hardened with CSP and HSTS headers, a COOP policy, and Firestore security rules.

## Tech Stack

Frontend: JavaScript, HTML, CSS. Backend / Platform: Firebase (Auth, Firestore, Hosting). Payments: Stripe. Monitoring: Sentry. Tooling: Python (PDF generation) and GitHub Actions (CI/CD).

## Getting Started

Serve locally with the Firebase CLI using `firebase emulators:start`. Build PDF resources with `python build_pdfs.py`. Deploy via GitHub Actions on push to main, or manually with `firebase deploy`.

## Project Structure

The app source lives in the `app/` directory, with guide content in `content/` and generated resources in `PDFs/`. PDF build scripts are `build_pdfs.py` and `build_premium.py`. Firestore security rules are in `firestore.rules`, and CI/CD auto-deploy workflows are in `.github/workflows/`.

## License

Add a license (e.g., MIT or proprietary).
