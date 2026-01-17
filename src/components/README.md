# Atomic Design Structure

This directory follows the Atomic Design methodology for component organization:

## 📁 Atoms
Basic building blocks - smallest components that can't be broken down further:
- Button
- Input
- Label
- Icon
- Typography
- etc.

## 🧩 Molecules
Simple combinations of atoms working together:
- FormField (Label + Input + Error)
- SearchBar (Input + Button)
- ProductCard (Image + Title + Price + Button)
- etc.

## 🏗️ Organisms
Complex UI sections made of molecules and atoms:
- Header/Navigation
- ProductList
- Footer
- LoginForm
- etc.

## 📄 Templates
Page-level layouts defining structure:
- MainLayout
- AuthLayout
- DashboardLayout
- etc.

## 📱 Pages
Specific page instances with real content:
- HomePage
- ProductDetailPage
- CheckoutPage
- etc.

## Guidelines
- Keep atoms pure and reusable
- Molecules should be domain-agnostic when possible
- Organisms contain business logic
- Use TypeScript for all components
- Export from index.ts files for clean imports
