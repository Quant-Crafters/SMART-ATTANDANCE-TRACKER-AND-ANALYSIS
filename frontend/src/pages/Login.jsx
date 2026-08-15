import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Mail,
  Lock,
  LogIn,
  Gauge,
  Eye,
  EyeOff,
  ShieldCheck,
  ScanFace,
  ArrowRight,
} from 'lucide-react';

import {
  useNavigate,
} from 'react-router-dom';

import apiClient from '../api/client';

const Login = () => {
  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const navigate = useNavigate();

  // =====================================================
  // MOUSE ANIMATION REFS
  // =====================================================

  const pageRef = useRef(null);
  const mouseTarget = useRef({
    x: 0,
    y: 0,
  });

  const mouseCurrent = useRef({
    x: 0,
    y: 0,
  });

  // =====================================================
  // SMOOTH MOUSE PARALLAX
  // =====================================================

  useEffect(() => {
    const page =
      pageRef.current;

    if (!page) {
      return;
    }

    let frameId;

    const handlePointerMove = (
      event
    ) => {
      const x =
        (event.clientX /
          window.innerWidth -
          0.5) *
        2;

      const y =
        (event.clientY /
          window.innerHeight -
          0.5) *
        2;

      mouseTarget.current = {
        x,
        y,
      };
    };

    const handlePointerLeave = () => {
      mouseTarget.current = {
        x: 0,
        y: 0,
      };
    };

    const animate = () => {
      const target =
        mouseTarget.current;

      const current =
        mouseCurrent.current;

      current.x +=
        (target.x - current.x) *
        0.045;

      current.y +=
        (target.y - current.y) *
        0.045;

      page.style.setProperty(
        '--mouse-x',
        `${current.x}`
      );

      page.style.setProperty(
        '--mouse-y',
        `${current.y}`
      );

      frameId =
        requestAnimationFrame(
          animate
        );
    };

    window.addEventListener(
      'pointermove',
      handlePointerMove,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'pointerleave',
      handlePointerLeave
    );

    animate();

    return () => {
      window.removeEventListener(
        'pointermove',
        handlePointerMove
      );

      window.removeEventListener(
        'pointerleave',
        handlePointerLeave
      );

      cancelAnimationFrame(
        frameId
      );
    };
  }, []);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError('');
      setLoading(true);

      try {
        const response =
          await apiClient.post(
            '/login',
            {
              email,
              password,
            }
          );

        console.log(
          'LOGIN RESPONSE:',
          response.data
        );

        const data =
          response.data?.data ||
          response.data;

        const token =
          data?.token ||
          data?.access_token;

        const user =
          data?.user;

        if (!token) {
          throw new Error(
            'Login succeeded but no token was returned.'
          );
        }

        localStorage.setItem(
          'token',
          token
        );

        if (user) {
          localStorage.setItem(
            'user',
            JSON.stringify(user)
          );
        }

        navigate('/dashboard');
      } catch (err) {
        console.error(
          'Login failed:',
          err
        );

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            'Invalid email or password.'
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div
      ref={pageRef}
      className="attendsmart-login"
    >

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="background-base" />

      <div className="ambient-glow glow-left" />
      <div className="ambient-glow glow-center" />
      <div className="ambient-glow glow-right" />

      <div className="background-noise" />

      {/* =====================================================
          INTERACTIVE WHITE DOT FIELD
      ===================================================== */}

      <div className="dot-field">

        <span className="magic-dot dot-01" />
        <span className="magic-dot dot-02" />
        <span className="magic-dot dot-03" />
        <span className="magic-dot dot-04" />
        <span className="magic-dot dot-05" />
        <span className="magic-dot dot-06" />
        <span className="magic-dot dot-07" />
        <span className="magic-dot dot-08" />
        <span className="magic-dot dot-09" />
        <span className="magic-dot dot-10" />
        <span className="magic-dot dot-11" />
        <span className="magic-dot dot-12" />
        <span className="magic-dot dot-13" />
        <span className="magic-dot dot-14" />
        <span className="magic-dot dot-15" />
        <span className="magic-dot dot-16" />
        <span className="magic-dot dot-17" />
        <span className="magic-dot dot-18" />

      </div>

      {/* =====================================================
          APP FRAME
      ===================================================== */}

      <div className="app-frame">

        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header className="topbar">

          <div className="brand">

            <div className="brand-icon">
              <Gauge size={17} />
            </div>

            <span className="brand-text">
              AttendSmart
            </span>

          </div>

          <nav className="top-navigation">

            <a href="#about">
              About
            </a>

            <a href="#home">
              Home
            </a>

            <a href="#contact">
              Contact
            </a>

            <a href="#support">
              Support
            </a>

          </nav>

        </header>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="main-content">

          {/* =================================================
              LEFT AUTH
          ================================================= */}

          <section className="auth-area">

            <div className="auth-box">

              <span className="auth-label">
                SECURE ACCESS
              </span>

              <h1 className="auth-title">
                Sign in
                <br />
                <span>
                  account
                </span>
              </h1>

              <p className="auth-subtitle">
                Enter your credentials to access
                your AttendSmart workspace.
              </p>

              <div className="mini-controls">

                <button
                  type="button"
                  className="mini-control"
                >
                  <ShieldCheck
                    size={15}
                  />
                </button>

                <button
                  type="button"
                  className="mini-control"
                >
                  <ScanFace
                    size={15}
                  />
                </button>

              </div>

              <div className="form-divider">

                <span />

                <small>
                  or continue with email
                </small>

                <span />

              </div>

              {error && (
                <div className="error-box">
                  {error}
                </div>
              )}

              {/* FORM */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="login-form"
              >

                {/* Email */}
                <div className="input-group">

                  <label htmlFor="email">
                    email
                  </label>

                  <div className="input-container">

                    <Mail size={15} />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="admin@college.edu"
                      autoComplete="email"
                      required
                    />

                  </div>

                </div>

                {/* Password */}
                <div className="input-group">

                  <label htmlFor="password">
                    password
                  </label>

                  <div className="input-container">

                    <Lock size={15} />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (
                            value
                          ) =>
                            !value
                        )
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={14}
                        />
                      ) : (
                        <Eye
                          size={14}
                        />
                      )}
                    </button>

                  </div>

                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="submit-button"
                >

                  {loading ? (
                    <>
                      <span className="button-spinner" />

                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn size={15} />

                      Sign in
                    </>
                  )}

                </button>

              </form>

              <div className="auth-bottom">

                <div className="secure-line">

                  <ShieldCheck
                    size={12}
                  />

                  <span>
                    Secure session
                  </span>

                </div>

                <span className="auth-product">
                  AttendSmart
                </span>

              </div>

            </div>

          </section>

          {/* =================================================
              VISUAL AREA
          ================================================= */}

          <section className="visual-area">

            <div className="visual-stage">

              {/* =================================================
                  INTERACTIVE SCULPTURE
              ================================================= */}

              <div className="sculpture-wrapper">

                <div className="sculpture-aura" />

                <div className="sculpture">

                  {/* Outer large organic body */}
                  <div className="sculpture-shell shell-a" />

                  <div className="sculpture-shell shell-b" />

                  <div className="sculpture-shell shell-c" />

                  {/* Inner mass */}
                  <div className="sculpture-body">

                    <div className="body-light light-a" />

                    <div className="body-light light-b" />

                    <div className="body-shadow shadow-a" />

                    <div className="body-shadow shadow-b" />

                    <div className="sculpture-core">

                      <Gauge
                        size={54}
                        strokeWidth={1.4}
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  VISUAL COPY
              ================================================= */}

              <div className="visual-copy">

                <span className="visual-label">
                  INTELLIGENT ATTENDANCE
                </span>

                <h2>
                  Attendance,
                  <br />
                  <span>
                    reimagined.
                  </span>
                </h2>

                <p>
                  Face verification, classroom
                  location checks and real-time
                  analytics working together in
                  one intelligent platform.
                </p>

                <div className="feature-list">

                  <div>
                    <span />
                    Face verification
                  </div>

                  <div>
                    <span />
                    Location verification
                  </div>

                  <div>
                    <span />
                    Live analytics
                  </div>

                </div>

                <div className="explore-button">
  Explore AttendSmart
  <ArrowRight size={13} />
</div>

              </div>

            </div>

          </section>

        </main>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="bottom-bar">

          <span>
            AttendSmart
          </span>

          <span>
            Automated Student Attendance
            Monitoring & Analytics
          </span>

          <span>
            2026
          </span>

        </footer>

      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        /* =================================================
           ROOT
        ================================================= */

        .attendsmart-login {

          --mouse-x: 0;
          --mouse-y: 0;

          position: relative;

          min-height: 100vh;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 72% 46%,
              rgba(92, 50, 160, 0.25),
              transparent 31%
            ),
            radial-gradient(
              circle at 15% 78%,
              rgba(70, 28, 110, 0.18),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #06040d 0%,
              #0d0717 50%,
              #090510 100%
            );

          color: white;
        }

        /* =================================================
           BASE
        ================================================= */

        .background-base {

          position: absolute;

          inset: 0;

          pointer-events: none;

          background:
            linear-gradient(
              115deg,
              rgba(9, 4, 17, 0.72),
              rgba(7, 4, 15, 0.96)
            );
        }

        .background-noise {

          position: absolute;

          inset: 0;

          pointer-events: none;

          opacity: 0.018;

          background-image:
            radial-gradient(
              rgba(255,255,255,0.3)
              0.6px,
              transparent 0.6px
            );

          background-size:
            5px 5px;
        }

        /* =================================================
           BACKGROUND LIGHT
        ================================================= */

        .ambient-glow {

          position: absolute;

          border-radius: 50%;

          pointer-events: none;

          filter: blur(105px);

          opacity: 0.17;
        }

        .glow-left {

          width: 400px;
          height: 400px;

          left: -120px;
          bottom: -90px;

          background:
            rgba(109,40,217,0.38);
        }

        .glow-center {

          width: 460px;
          height: 460px;

          left: 43%;
          top: 18%;

          background:
            rgba(124,58,237,0.18);

          transform:
            translate(
              calc(var(--mouse-x) * 7px),
              calc(var(--mouse-y) * 7px)
            );
        }

        .glow-right {

          width: 320px;
          height: 320px;

          right: -80px;
          bottom: -50px;

          background:
            rgba(67,56,202,0.20);
        }

        /* =================================================
           DOT FIELD
        ================================================= */

        .dot-field {

          position: absolute;

          inset: 0;

          z-index: 2;

          pointer-events: none;

          overflow: hidden;
        }

        .magic-dot {

          position: absolute;

          width: 5px;
          height: 5px;

          border-radius: 50%;

          background:
            rgba(236,233,255,0.95);

          box-shadow:
            0
            0
            12px
            rgba(196,181,253,0.80),

            0
            0
            24px
            rgba(167,139,250,0.35);

          will-change:
            transform;

          transform:
            translate(
              calc(var(--mouse-x) * var(--mx)),
              calc(var(--mouse-y) * var(--my))
            );
        }

        .magic-dot::after {

          content: "";

          position: absolute;

          inset: -4px;

          border-radius: 50%;

          background:
            rgba(196,181,253,0.08);

          filter:
            blur(4px);
        }

        .dot-01 {
          left: 51%;
          top: 19%;
          --mx: -8px;
          --my: -5px;
          animation:
            dotPulseOne
            4.8s
            ease-in-out
            infinite;
        }

        .dot-02 {
          left: 61%;
          top: 30%;
          width: 4px;
          height: 4px;
          --mx: 10px;
          --my: -7px;
          animation:
            dotPulseTwo
            5.6s
            ease-in-out
            infinite;
        }

        .dot-03 {
          left: 69%;
          top: 27%;
          --mx: -6px;
          --my: 8px;
          animation:
            dotPulseThree
            4.2s
            ease-in-out
            infinite;
        }

        .dot-04 {
          left: 76%;
          top: 38%;
          width: 4px;
          height: 4px;
          --mx: 12px;
          --my: -4px;
          animation:
            dotPulseOne
            6s
            ease-in-out
            infinite;
        }

        .dot-05 {
          left: 55%;
          top: 46%;
          width: 3px;
          height: 3px;
          --mx: -12px;
          --my: 9px;
          animation:
            dotPulseTwo
            5s
            ease-in-out
            infinite;
        }

        .dot-06 {
          left: 83%;
          top: 51%;
          --mx: 8px;
          --my: 5px;
          animation:
            dotPulseThree
            4.4s
            ease-in-out
            infinite;
        }

        .dot-07 {
          left: 73%;
          top: 63%;
          width: 4px;
          height: 4px;
          --mx: -9px;
          --my: -9px;
          animation:
            dotPulseOne
            5.8s
            ease-in-out
            infinite;
        }

        .dot-08 {
          left: 58%;
          top: 70%;
          --mx: 7px;
          --my: -8px;
          animation:
            dotPulseTwo
            4.6s
            ease-in-out
            infinite;
        }

        .dot-09 {
          left: 89%;
          top: 71%;
          width: 3px;
          height: 3px;
          --mx: -7px;
          --my: 6px;
          animation:
            dotPulseThree
            6.2s
            ease-in-out
            infinite;
        }

        .dot-10 {
          left: 45%;
          top: 61%;
          width: 4px;
          height: 4px;
          --mx: 13px;
          --my: 6px;
          animation:
            dotPulseOne
            5.2s
            ease-in-out
            infinite;
        }

        .dot-11 {
          left: 87%;
          top: 25%;
          width: 3px;
          height: 3px;
          --mx: -9px;
          --my: -6px;
          animation:
            dotPulseTwo
            4.8s
            ease-in-out
            infinite;
        }

        .dot-12 {
          left: 65%;
          top: 79%;
          width: 4px;
          height: 4px;
          --mx: 6px;
          --my: -10px;
          animation:
            dotPulseThree
            6s
            ease-in-out
            infinite;
        }

        .dot-13 {
          left: 80%;
          top: 17%;
          width: 3px;
          height: 3px;
          --mx: 12px;
          --my: 5px;
          animation:
            dotPulseOne
            4.5s
            ease-in-out
            infinite;
        }

        .dot-14 {
          left: 48%;
          top: 78%;
          width: 3px;
          height: 3px;
          --mx: -8px;
          --my: -11px;
          animation:
            dotPulseTwo
            5.4s
            ease-in-out
            infinite;
        }

        .dot-15 {
          left: 93%;
          top: 47%;
          width: 4px;
          height: 4px;
          --mx: 7px;
          --my: 8px;
          animation:
            dotPulseThree
            5.9s
            ease-in-out
            infinite;
        }

        .dot-16 {
          left: 40%;
          top: 38%;
          width: 3px;
          height: 3px;
          --mx: 10px;
          --my: -6px;
          animation:
            dotPulseOne
            4.9s
            ease-in-out
            infinite;
        }

        .dot-17 {
          left: 71%;
          top: 82%;
          width: 3px;
          height: 3px;
          --mx: -12px;
          --my: 7px;
          animation:
            dotPulseTwo
            5.5s
            ease-in-out
            infinite;
        }

        .dot-18 {
          left: 84%;
          top: 84%;
          width: 4px;
          height: 4px;
          --mx: 8px;
          --my: -5px;
          animation:
            dotPulseThree
            4.7s
            ease-in-out
            infinite;
        }

        /* =================================================
           FRAME
        ================================================= */

        .app-frame {

          position: relative;

          z-index: 5;

          width:
            min(1440px, 96vw);

          min-height:
            100vh;

          margin:
            0 auto;

          display:
            flex;

          flex-direction:
            column;
        }

        /* =================================================
           HEADER
        ================================================= */

        .topbar {

          height:
            72px;

          flex-shrink:
            0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          padding:
            0 30px;

          border-bottom:
            1px solid
            rgba(255,255,255,0.04);
        }

        .brand {

          display:
            flex;

          align-items:
            center;

          gap:
            10px;
        }

        .brand-icon {

          width:
            31px;

          height:
            31px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            9px;

          color:
            #c4b5fd;

          border:
            1px solid
            rgba(196,181,253,0.20);

          background:
            rgba(124,58,237,0.10);
        }

        .brand-text {

          color:
            #eee9f6;

          font-size:
            12px;

          font-weight:
            700;
        }

        .top-navigation {

          display:
            flex;

          gap:
            28px;
        }

        .top-navigation a {

          color:
            #625b6d;

          font-size:
            9px;

          text-decoration:
            none;

          transition:
            color 160ms ease;
        }

        .top-navigation a:hover {
          color:
            #ddd6fe;
        }

        /* =================================================
           MAIN
        ================================================= */

        .main-content {

          flex:
            1;

          min-height:
            calc(100vh - 122px);

          display:
            grid;

          grid-template-columns:
            39%
            61%;
        }

        /* =================================================
           AUTH AREA
        ================================================= */

        .auth-area {

          display:
            flex;

          align-items:
            center;

          padding:
            45px
            35px
            55px
            62px;
        }

        .auth-box {

          width:
            100%;

          max-width:
            390px;

          animation:
            authEnter
            680ms
            cubic-bezier(.22,.61,.36,1)
            both;
        }

        .auth-label {

          display:
            inline-block;

          color:
            #a78bfa;

          font-size:
            9px;

          font-weight:
            700;

          letter-spacing:
            0.19em;
        }

        .auth-title {

          margin-top:
            15px;

          color:
            #f8fafc;

          font-size:
            clamp(38px, 4vw, 54px);

          line-height:
            0.95;

          font-weight:
            800;

          letter-spacing:
            -0.055em;
        }

        .auth-title span {
          color:
            #a78bfa;
        }

        .auth-subtitle {

          margin-top:
            15px;

          max-width:
            310px;

          color:
            #716a7c;

          font-size:
            11px;

          line-height:
            1.7;
        }

        /* =================================================
           MINI CONTROLS
        ================================================= */

        .mini-controls {

          display:
            flex;

          gap:
            8px;

          margin-top:
            19px;
        }

        .mini-control {

          width:
            31px;

          height:
            30px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border:
            1px solid
            rgba(255,255,255,0.08);

          border-radius:
            9px;

          background:
            rgba(255,255,255,0.02);

          color:
            #746c82;

          transition:
            color 160ms ease,
            border-color 160ms ease,
            background 160ms ease;
        }

        .mini-control:hover {

          color:
            #c4b5fd;

          border-color:
            rgba(196,181,253,0.23);

          background:
            rgba(124,58,237,0.06);
        }

        /* =================================================
           DIVIDER
        ================================================= */

        .form-divider {

          display:
            flex;

          align-items:
            center;

          gap:
            10px;

          margin:
            23px 0 17px;
        }

        .form-divider span {

          flex:
            1;

          height:
            1px;

          background:
            rgba(255,255,255,0.065);
        }

        .form-divider small {

          color:
            #4f4858;

          font-size:
            8px;

          white-space:
            nowrap;
        }

        /* =================================================
           ERROR
        ================================================= */

        .error-box {

          margin-bottom:
            15px;

          padding:
            10px 12px;

          border:
            1px solid
            rgba(248,113,113,0.15);

          border-radius:
            9px;

          background:
            rgba(127,29,29,0.08);

          color:
            #fca5a5;

          font-size:
            10px;

          line-height:
            1.5;
        }

        /* =================================================
           FORM
        ================================================= */

        .login-form {

          display:
            flex;

          flex-direction:
            column;

          gap:
            14px;
        }

        .input-group label {

          display:
            block;

          margin-bottom:
            6px;

          color:
            #736b7d;

          font-size:
            9px;

          text-transform:
            lowercase;
        }

        .input-container {

          position:
            relative;

          height:
            42px;

          display:
            flex;

          align-items:
            center;

          border:
            1px solid
            rgba(255,255,255,0.09);

          border-radius:
            9px;

          background:
            rgba(4,3,12,0.25);

          transition:
            border-color 180ms ease,
            box-shadow 180ms ease,
            background 180ms ease;
        }

        .input-container > svg {

          margin-left:
            12px;

          color:
            #51495b;

          flex-shrink:
            0;

          transition:
            color 180ms ease;
        }

        .input-container:focus-within {

          border-color:
            rgba(167,139,250,0.39);

          background:
            rgba(124,58,237,0.035);

          box-shadow:
            0
            0
            0
            3px
            rgba(124,58,237,0.045);
        }

        .input-container:focus-within > svg {
          color:
            #a78bfa;
        }

        .input-container input {

          width:
            100%;

          height:
            100%;

          min-width:
            0;

          padding:
            0 10px;

          border:
            none;

          outline:
            none;

          background:
            transparent;

          color:
            #f8fafc;

          font-size:
            10px;
        }

        .input-container input::placeholder {
          color:
            #3a3441;
        }

        .password-toggle {

          width:
            31px;

          height:
            31px;

          margin-right:
            3px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            8px;

          color:
            #51495b;

          background:
            transparent;

          transition:
            color 150ms ease,
            background 150ms ease;
        }

        .password-toggle:hover {

          color:
            #c4b5fd;

          background:
            rgba(255,255,255,0.04);
        }

        /* =================================================
           BUTTON
        ================================================= */

        .submit-button {

          width:
            100%;

          height:
            43px;

          margin-top:
            5px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            7px;

          border:
            none;

          border-radius:
            9px;

          color:
            #100715;

          background:
            linear-gradient(
              110deg,
              #d4a8ff,
              #ecd7ff,
              #c5b3ff
            );

          font-size:
            10px;

          font-weight:
            750;

          cursor:
            pointer;

          box-shadow:
            0
            10px
            26px
            rgba(167,139,250,0.13);

          transition:
            transform 170ms ease,
            box-shadow 170ms ease;
        }

        .submit-button:hover:not(:disabled) {

          transform:
            translateY(-1px);

          box-shadow:
            0
            15px
            34px
            rgba(167,139,250,0.20);
        }

        .submit-button:disabled {
          cursor:
            not-allowed;

          opacity:
            0.55;
        }

        .button-spinner {

          width:
            13px;

          height:
            13px;

          border:
            2px solid
            rgba(17,7,21,0.23);

          border-top-color:
            rgba(17,7,21,0.88);

          border-radius:
            50%;

          animation:
            spin
            700ms
            linear
            infinite;
        }

        /* =================================================
           AUTH BOTTOM
        ================================================= */

        .auth-bottom {

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          margin-top:
            18px;

          padding-top:
            14px;

          border-top:
            1px solid
            rgba(255,255,255,0.045);

          color:
            #423b4b;

          font-size:
            8px;
        }

        .secure-line {

          display:
            flex;

          align-items:
            center;

          gap:
            5px;
        }

        .secure-line svg {
          color:
            #34d399;
        }

        /* =================================================
           VISUAL
        ================================================= */

        .visual-area {

          position:
            relative;

          min-width:
            0;
        }

        .visual-stage {

          position:
            relative;

          width:
            100%;

          height:
            100%;

          min-height:
            620px;
        }

        /* =================================================
           SCULPTURE WRAPPER
        ================================================= */

        .sculpture-wrapper {

          position:
            absolute;

          left:
            42%;

          top:
            48%;

          width:
            620px;

          height:
            620px;

          transform:
            translate(
              calc(-50% + var(--mouse-x) * 10px),
              calc(-50% + var(--mouse-y) * 10px)
            );
        }

        .sculpture-aura {

          position:
            absolute;

          inset:
            55px;

          border-radius:
            50%;

          background:
            radial-gradient(
              ellipse at center,
              rgba(183,157,255,0.22),
              rgba(124,58,237,0.08) 38%,
              transparent 73%
            );

          filter:
            blur(44px);

          transform:
            translate(
              calc(var(--mouse-x) * -6px),
              calc(var(--mouse-y) * -6px)
            );

          animation:
            auraPulse
            6.5s
            ease-in-out
            infinite;
        }

        /* =================================================
           3D SCULPTURE
        ================================================= */

        .sculpture {

          position:
            absolute;

          left:
            50%;

          top:
            50%;

          width:
            350px;

          height:
            430px;

          transform:
            translate(-50%, -50%)
            rotateY(calc(var(--mouse-x) * 7deg))
            rotateX(calc(var(--mouse-y) * -5deg));

          transform-style:
            preserve-3d;

          animation:
            sculptureRotate
            15s
            linear
            infinite;

          will-change:
            transform;
        }

        /* =================================================
           OUTER ORGANIC LAYERS
        ================================================= */

        .sculpture-shell {

          position:
            absolute;

          left:
            50%;

          top:
            50%;

          transform:
            translate(-50%, -50%);

          border-radius:
            44%
            56%
            50%
            50%
            /
            58%
            43%
            57%
            42%;

          border:
            2px
            solid
            rgba(220,207,255,0.15);

          box-shadow:

            inset
            16px
            10px
            42px
            rgba(255,255,255,0.045),

            inset
            -27px
            -25px
            60px
            rgba(0,0,0,0.62),

            0
            28px
            90px
            rgba(0,0,0,0.42);
        }

        .shell-a {

          width:
            285px;

          height:
            397px;

          transform:
            translate(-50%, -50%)
            rotate(7deg);

          background:
            linear-gradient(
              145deg,
              rgba(212,193,255,0.21),
              rgba(104,62,149,0.13) 37%,
              rgba(10,6,20,0.91) 100%
            );
        }

        .shell-b {

          width:
            322px;

          height:
            365px;

          transform:
            translate(-50%, -50%)
            rotate(-14deg);

          background:
            linear-gradient(
              155deg,
              rgba(188,159,242,0.16),
              rgba(91,50,127,0.12) 42%,
              rgba(9,5,18,0.94) 100%
            );

          border-color:
            rgba(196,181,253,0.17);
        }

        .shell-c {

          width:
            252px;

          height:
            415px;

          transform:
            translate(-50%, -50%)
            rotate(25deg);

          background:
            linear-gradient(
              150deg,
              rgba(235,226,255,0.15),
              rgba(103,69,147,0.11) 41%,
              rgba(7,4,14,0.97) 100%
            );

          border-color:
            rgba(221,214,254,0.18);
        }

        /* =================================================
           CENTRAL BODY
        ================================================= */

        .sculpture-body {

          position:
            absolute;

          left:
            50%;

          top:
            50%;

          width:
            205px;

          height:
            304px;

          transform:
            translate(-50%, -50%);

          border-radius:
            43%
            57%
            48%
            52%
            /
            58%
            44%
            56%
            42%;

          background:
            linear-gradient(
              160deg,
              rgba(233,220,255,0.24),
              rgba(138,93,184,0.24) 24%,
              rgba(66,36,91,0.38) 47%,
              rgba(20,8,30,0.87) 76%,
              rgba(5,3,11,0.99) 100%
            );

          border:
            2px
            solid
            rgba(239,232,255,0.20);

          box-shadow:

            inset
            18px
            9px
            48px
            rgba(255,255,255,0.06),

            inset
            -25px
            -28px
            60px
            rgba(0,0,0,0.72),

            inset
            0
            0
            40px
            rgba(124,58,237,0.10),

            0
            36px
            100px
            rgba(0,0,0,0.5);
        }

        /* =================================================
           BODY LIGHTS
        ================================================= */

        .body-light {

          position:
            absolute;

          border-radius:
            50%;

          pointer-events:
            none;

          filter:
            blur(10px);
        }

        .light-a {

          width:
            95px;

          height:
            250px;

          left:
            20px;

          top:
            14px;

          transform:
            rotate(14deg);

          background:
            linear-gradient(
              to bottom,
              rgba(255,255,255,0.20),
              rgba(196,181,253,0.05),
              transparent
            );
        }

        .light-b {

          width:
            42px;

          height:
            135px;

          right:
            16px;

          top:
            70px;

          background:
            rgba(167,139,250,0.13);

          filter:
            blur(15px);
        }

        /* =================================================
           DARK INTERNAL SHADOWS
        ================================================= */

        .body-shadow {

          position:
            absolute;

          border-radius:
            50%;

          background:
            rgba(0,0,0,0.40);

          filter:
            blur(9px);
        }

        .shadow-a {

          width:
            80px;

          height:
            220px;

          left:
            62px;

          top:
            28px;

          transform:
            rotate(-11deg);
        }

        .shadow-b {

          width:
            50px;

          height:
            135px;

          right:
            27px;

          bottom:
            25px;

          opacity:
            0.72;
        }

        /* =================================================
           CENTER GLASS
        ================================================= */

        .sculpture-core {

          position:
            absolute;

          left:
            50%;

          top:
            50%;

          width:
            100px;

          height:
            122px;

          transform:
            translate(-50%, -50%);

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            30px;

          border:
            1px
            solid
            rgba(255,255,255,0.14);

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.09),
              rgba(255,255,255,0.024)
            );

          box-shadow:

            inset
            0
            1px
            0
            rgba(255,255,255,0.09),

            inset
            0
            0
            34px
            rgba(124,58,237,0.09),

            0
            18px
            48px
            rgba(0,0,0,0.42);

          backdrop-filter:
            blur(11px);

          -webkit-backdrop-filter:
            blur(11px);
        }

        .sculpture-core svg {

          color:
            #d4c4ff;

          filter:
            drop-shadow(
              0
              0
              18px
              rgba(196,181,253,0.48)
            );
        }

        /* =================================================
           VISUAL COPY
        ================================================= */

        .visual-copy {

          position:
            absolute;

          right:
            5%;

          bottom:
            16%;

          width:
            235px;
        }

        .visual-label {

          color:
            #8b5cf6;

          font-size:
            8px;

          font-weight:
            700;

          letter-spacing:
            0.20em;
        }

        .visual-copy h2 {

          margin-top:
            11px;

          color:
            #f8fafc;

          font-size:
            29px;

          line-height:
            1.02;

          letter-spacing:
            -0.05em;

          font-weight:
            760;
        }

        .visual-copy h2 span {
          color:
            #a78bfa;
        }

        .visual-copy > p {

          margin-top:
            13px;

          color:
            #6d6576;

          font-size:
            9px;

          line-height:
            1.8;
        }

        .feature-list {

          margin-top:
            13px;

          display:
            flex;

          flex-direction:
            column;

          gap:
            7px;
        }

        .feature-list div {

          display:
            flex;

          align-items:
            center;

          gap:
            7px;

          color:
            #777080;

          font-size:
            8px;
        }

        .feature-list span {

          width:
            4px;

          height:
            4px;

          border-radius:
            50%;

          background:
            #a78bfa;

          box-shadow:
            0
            0
            9px
            rgba(167,139,250,0.8);
        }

        .explore-button {

          margin-top:
            14px;

          display:
            inline-flex;

          align-items:
            center;

          gap:
            6px;

          border:
            none;

          padding:
            0;

          color:
            #a78bfa;

          background:
            transparent;

          font-size:
            8px;

          cursor:
            pointer;

          transition:
            color 150ms ease,
            transform 150ms ease;
        }

        .explore-button:hover {

          color:
            #ddd6fe;

          transform:
            translateX(2px);
        }

        /* =================================================
           FOOTER
        ================================================= */

        .bottom-bar {

          height:
            50px;

          flex-shrink:
            0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          padding:
            0 30px;

          border-top:
            1px
            solid
            rgba(255,255,255,0.035);

          color:
            #403948;

          font-size:
            8px;
        }

        /* =================================================
           ANIMATIONS
        ================================================= */

        @keyframes authEnter {

          from {
            opacity:
              0;

            transform:
              translateY(12px);
          }

          to {
            opacity:
              1;

            transform:
              translateY(0);
          }
        }

        @keyframes sculptureRotate {

          0% {

            transform:
              translate(-50%, -50%)
              rotateY(
                calc(
                  var(--mouse-x) * 7deg
                )
              )
              rotateX(
                calc(
                  var(--mouse-y) * -5deg
                )
              )
              rotateZ(-2deg);
          }

          25% {

            transform:
              translate(-50%, -50%)
              rotateY(
                calc(
                  90deg +
                  var(--mouse-x) * 7deg
                )
              )
              rotateX(
                calc(
                  var(--mouse-y) * -5deg
                )
              )
              rotateZ(1deg);
          }

          50% {

            transform:
              translate(-50%, -50%)
              rotateY(
                calc(
                  180deg +
                  var(--mouse-x) * 7deg
                )
              )
              rotateX(
                calc(
                  var(--mouse-y) * -5deg
                )
              )
              rotateZ(2deg);
          }

          75% {

            transform:
              translate(-50%, -50%)
              rotateY(
                calc(
                  270deg +
                  var(--mouse-x) * 7deg
                )
              )
              rotateX(
                calc(
                  var(--mouse-y) * -5deg
                )
              )
              rotateZ(-1deg);
          }

          100% {

            transform:
              translate(-50%, -50%)
              rotateY(
                calc(
                  360deg +
                  var(--mouse-x) * 7deg
                )
              )
              rotateX(
                calc(
                  var(--mouse-y) * -5deg
                )
              )
              rotateZ(-2deg);
          }
        }

        @keyframes auraPulse {

          0%,
          100% {

            transform:
              scale(0.95)
              translate(
                calc(var(--mouse-x) * -4px),
                calc(var(--mouse-y) * -4px)
              );

            opacity:
              0.55;
          }

          50% {

            transform:
              scale(1.07)
              translate(
                calc(var(--mouse-x) * -4px),
                calc(var(--mouse-y) * -4px)
              );

            opacity:
              0.88;
          }
        }

        @keyframes dotPulseOne {

          0%,
          100% {
            opacity:
              0.25;
            transform:
              translateY(0)
              scale(0.8);
          }

          50% {
            opacity:
              1;
            transform:
              translateY(-10px)
              scale(1.25);
          }
        }

        @keyframes dotPulseTwo {

          0%,
          100% {
            opacity:
              0.18;
            transform:
              translateY(0)
              scale(0.75);
          }

          50% {
            opacity:
              0.85;
            transform:
              translateY(8px)
              scale(1.15);
          }
        }

        @keyframes dotPulseThree {

          0%,
          100% {
            opacity:
              0.30;
            transform:
              translateY(0)
              scale(0.85);
          }

          50% {
            opacity:
              1;
            transform:
              translateY(-7px)
              scale(1.20);
          }
        }

        @keyframes spin {

          to {
            transform:
              rotate(360deg);
          }
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1120px) {

          .main-content {
            grid-template-columns:
              42%
              58%;
          }

          .auth-area {
            padding-left:
              38px;

            padding-right:
              20px;
          }

          .sculpture-wrapper {
            transform:
              translate(
                calc(-50% + var(--mouse-x) * 8px),
                calc(-50% + var(--mouse-y) * 8px)
              )
              scale(0.88);
          }

          .visual-copy {
            right:
              2%;
          }
        }

        @media (max-width: 900px) {

          .app-frame {
            width:
              100%;
          }

          .main-content {
            display:
              block;
          }

          .auth-area {
            min-height:
              calc(100vh - 72px);

            padding:
              35px
              22px
              60px;
          }

          .auth-box {
            margin:
              0 auto;
          }

          .visual-area {
            display:
              none;
          }

          .dot-field {
            display:
              none;
          }

          .bottom-bar {
            display:
              none;
          }
        }

        @media (max-width: 600px) {

          .topbar {
            padding:
              0 16px;
          }

          .top-navigation {
            gap:
              13px;
          }

          .top-navigation a {
            font-size:
              8px;
          }

          .auth-area {
            padding:
              25px
              16px
              35px;
          }

          .auth-title {
            font-size:
              40px;
          }
        }

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            animation-duration:
              0.01ms !important;

            animation-iteration-count:
              1 !important;
          }
        }

      `}</style>
    </div>
  );
};

export default Login;