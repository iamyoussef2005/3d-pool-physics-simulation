# 3D Billiards Physics Simulation

A 3D Billiards (Pool) simulation built from scratch featuring a custom JavaScript physics engine and interactive 3D graphics rendered using [Three.js](https://threejs.org/).

The simulation models real-world billiard table physics, including kinetic friction, rolling resistance, sliding-to-rolling state transitions, and spin (angular momentum).

---

## 🚀 Key Features

* **Custom Physics Engine (`physics.js`):** Built from scratch without external physics libraries.
  * **Vector Mathematics:** 3D Vector operations class (`Vector3D`).
  * **Numerical Integration:** Euler integration for velocity and position updates.
  * **Friction & Torque:** Models sliding kinetic friction ($f_k = \mu_k \cdot N$) and the transition into pure rolling ($v = R \cdot \omega$).
  * **Stabilization:** Implements velocity thresholds to avoid numerical jitter (sleeping state).
* **3D Graphics & Rendering (`main.js`):**
  * Realistic billiard table rendering (cushions, pockets, and green felt cloth).
  * High-quality billiard ball meshes with striped textures (for balls 10 and 14).
  * White cue ball and interactive cue stick representation.
* **Academic/Scientific Grounding:** Follows specific mathematical modeling from the attached `Report.pdf`.

---

## 📁 Project Structure

```
pool-game/
├── index.html              # Main webpage entry point
├── main.js                 # Graphics renderer & animation loop (Three.js)
├── physics.js              # Custom 3D physics engine (Vector3D, PhysBall, PhysicsEngine)
├── style.css               # Page styling & layouts
├── three.module.js         # Three.js Core Library
├── OrbitControls.js        # Camera movement controls
├── RoundedBoxGeometry.js   # Custom geometry helper for the table structure
├── Report.pdf              # Scientific report and physics derivations
└── README.md               # Project documentation
```

---

## 🛠️ Getting Started

### Prerequisites
To run the simulation locally, you need a web browser and a simple local HTTP server (to handle ES6 module imports).

### Running Locally

1. **Serve the folder using a local server:**
   * **Python 3:** Run `python -m http.server 8000` in the directory.
   * **Node.js (http-server):** Run `npx http-server` or use VS Code's **Live Server** extension.

2. **Open the browser:**
   Go to `http://localhost:8000` (or the port specified by your server).

---

## ⚙️ Physical Formulas Implemented

* **Kinetic Friction Force:**
  $$F_k = -\mu_k \cdot m \cdot g \cdot \hat{v}$$
* **Sliding-to-Rolling Transition:**
  The engine monitors the sliding velocity at the point of contact:
  $$v_{rel} = v + \omega \times R$$
  When $v_{rel} \approx 0$, the ball shifts from sliding friction to pure rolling resistance, updating the angular velocity to match linear velocity:
  $$v = R \cdot \omega$$

---

## 👥 Contributors & Roles

* **Physics Core:** Youssef Nizar Ahmed
* **3D Graphics & Scenes:** Omar
* **Collisions & Stick Strikes:** Hussam Al-Ibrahim
* **UI Controls & Interactivity:** Hussam Hariri
* **Mathematics Verification & Testing:** Mohammed & Hamza
