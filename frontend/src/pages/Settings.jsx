import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

import {
  Settings as SettingsIcon,
  MapPin,
  ShieldCheck,
  User,
  Save,
  CheckCircle,
  AlertTriangle,
  Gauge,
  Building2,
  Lock,
  Navigation,
  RotateCcw,
  Crosshair,
  Radio,
  ScanLine,
  Camera,
  Smartphone,
  LocateFixed,
} from 'lucide-react';

const STORAGE_KEY = 'attendsmart_classroom_settings';

const DEFAULT_SETTINGS = {
  classroom: '',
  latitude: '',
  longitude: '',
  radius: '2',
  dynamicQR: true,
  locationVerification: true,
  faceVerification: true,
  duplicateProtection: true,
};

const Settings = () => {
  const [role, setRole] = useState('');

  const [classroom, setClassroom] =
    useState('');

  const [latitude, setLatitude] =
    useState('');

  const [longitude, setLongitude] =
    useState('');

  const [radius, setRadius] =
    useState('2');

  const [dynamicQR, setDynamicQR] =
    useState(true);

  const [locationVerification, setLocationVerification] =
    useState(true);

  const [faceVerification, setFaceVerification] =
    useState(true);

  const [duplicateProtection, setDuplicateProtection] =
    useState(true);

  const [currentLatitude, setCurrentLatitude] =
    useState('');

  const [currentLongitude, setCurrentLongitude] =
    useState('');

  const [distance, setDistance] =
    useState(null);

  const [locationStatus, setLocationStatus] =
    useState('');

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  // =====================================================
  // ROLE
  // =====================================================

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem('user');

      if (savedUser) {
        const user =
          JSON.parse(savedUser);

        setRole(
          String(
            user?.role || ''
          ).toLowerCase()
        );
      }
    } catch (err) {
      console.error(
        'Settings role error:',
        err
      );
    }
  }, []);

  // =====================================================
  // LOAD SAVED SETTINGS
  // =====================================================

  useEffect(() => {
    if (role !== 'faculty') {
      return;
    }

    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const settings =
        JSON.parse(saved);

      setClassroom(
        settings.classroom || ''
      );

      setLatitude(
        settings.latitude || ''
      );

      setLongitude(
        settings.longitude || ''
      );

      setRadius(
        String(
          settings.radius ?? 2
        )
      );

      setDynamicQR(
        settings.dynamicQR ??
          true
      );

      setLocationVerification(
        settings.locationVerification ??
          true
      );

      setFaceVerification(
        settings.faceVerification ??
          true
      );

      setDuplicateProtection(
        settings.duplicateProtection ??
          true
      );
    } catch (err) {
      console.error(
        'Classroom settings load error:',
        err
      );
    }
  }, [role]);

  // =====================================================
  // GET CURRENT LOCATION
  // =====================================================

  const getCurrentLocation = () => {
    setMessage('');
    setError('');
    setLocationStatus('');
    setDistance(null);

    if (!navigator.geolocation) {
      setError(
        'Geolocation is not supported by this browser.'
      );

      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        setCurrentLatitude(
          lat.toFixed(7)
        );

        setCurrentLongitude(
          lng.toFixed(7)
        );

        setLoadingLocation(false);

        setLocationStatus(
          'Current location detected successfully.'
        );
      },
      (geoError) => {
        console.error(
          'Geolocation error:',
          geoError
        );

        setLoadingLocation(false);

        if (
          geoError.code ===
          geoError.PERMISSION_DENIED
        ) {
          setError(
            'Location permission was denied. Please allow location access in your browser.'
          );
        } else if (
          geoError.code ===
          geoError.POSITION_UNAVAILABLE
        ) {
          setError(
            'Your current location could not be determined.'
          );
        } else if (
          geoError.code ===
          geoError.TIMEOUT
        ) {
          setError(
            'Location request timed out. Please try again.'
          );
        } else {
          setError(
            'Unable to get your current location.'
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // =====================================================
  // HAVERSINE DISTANCE
  // =====================================================

  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const toRadians = (value) =>
      (value * Math.PI) / 180;

    const earthRadius = 6371000;

    const dLat = toRadians(
      lat2 - lat1
    );

    const dLon = toRadians(
      lon2 - lon1
    );

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return earthRadius * c;
  };

  // =====================================================
  // TEST CURRENT LOCATION
  // =====================================================

  const testLocation = () => {
    setMessage('');
    setError('');
    setLocationStatus('');
    setDistance(null);

    if (
      !latitude ||
      !longitude
    ) {
      setError(
        'Save or enter the classroom latitude and longitude first.'
      );

      return;
    }

    if (
      !currentLatitude ||
      !currentLongitude
    ) {
      setError(
        'Click "Use Current Location" first.'
      );

      return;
    }

    const classroomLat =
      Number(latitude);

    const classroomLng =
      Number(longitude);

    const userLat =
      Number(currentLatitude);

    const userLng =
      Number(currentLongitude);

    if (
      !Number.isFinite(
        classroomLat
      ) ||
      !Number.isFinite(
        classroomLng
      ) ||
      !Number.isFinite(
        userLat
      ) ||
      !Number.isFinite(
        userLng
      )
    ) {
      setError(
        'The configured coordinates are invalid.'
      );

      return;
    }

    const calculatedDistance =
      calculateDistance(
        classroomLat,
        classroomLng,
        userLat,
        userLng
      );

    setDistance(
      calculatedDistance
    );

    const allowedRadius =
      Number(radius);

    if (
      calculatedDistance <=
      allowedRadius
    ) {
      setLocationStatus(
        'Inside classroom verification zone.'
      );
    } else {
      setLocationStatus(
        'Outside classroom verification zone.'
      );
    }
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSaveClassroom = (
    event
  ) => {
    event.preventDefault();

    setMessage('');
    setError('');

    const numericRadius =
      Number(radius);

    const numericLatitude =
      Number(latitude);

    const numericLongitude =
      Number(longitude);

    if (!classroom.trim()) {
      setError(
        'Please enter a classroom name.'
      );

      return;
    }

    if (
      !Number.isFinite(
        numericLatitude
      ) ||
      numericLatitude < -90 ||
      numericLatitude > 90
    ) {
      setError(
        'Please enter a valid latitude between -90 and 90.'
      );

      return;
    }

    if (
      !Number.isFinite(
        numericLongitude
      ) ||
      numericLongitude < -180 ||
      numericLongitude > 180
    ) {
      setError(
        'Please enter a valid longitude between -180 and 180.'
      );

      return;
    }

    if (
      !Number.isFinite(
        numericRadius
      ) ||
      numericRadius < 0.5 ||
      numericRadius > 20
    ) {
      setError(
        'Allowed radius must be between 0.5 m and 20 m.'
      );

      return;
    }

    const settings = {
      classroom:
        classroom.trim(),

      latitude:
        String(numericLatitude),

      longitude:
        String(numericLongitude),

      radius:
        numericRadius,

      dynamicQR,

      locationVerification,

      faceVerification,

      duplicateProtection,

      updatedAt:
        new Date().toISOString(),
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings)
    );

    setMessage(
      'Classroom attendance settings saved successfully on this device.'
    );
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetSettings = () => {
    localStorage.removeItem(
      STORAGE_KEY
    );

    setClassroom(
      DEFAULT_SETTINGS.classroom
    );

    setLatitude(
      DEFAULT_SETTINGS.latitude
    );

    setLongitude(
      DEFAULT_SETTINGS.longitude
    );

    setRadius(
      DEFAULT_SETTINGS.radius
    );

    setDynamicQR(
      DEFAULT_SETTINGS.dynamicQR
    );

    setLocationVerification(
      DEFAULT_SETTINGS.locationVerification
    );

    setFaceVerification(
      DEFAULT_SETTINGS.faceVerification
    );

    setDuplicateProtection(
      DEFAULT_SETTINGS.duplicateProtection
    );

    setCurrentLatitude('');
    setCurrentLongitude('');
    setDistance(null);
    setLocationStatus('');

    setError('');
    setMessage(
      'Classroom settings have been reset.'
    );
  };

  // =====================================================
  // QUICK RADIUS
  // =====================================================

  const quickRadii = [
    '0.5',
    '1',
    '2',
    '3',
    '5',
    '10',
  ];

  // =====================================================
  // LOCATION TEST STATUS
  // =====================================================

  const isInsideZone =
    distance !== null &&
    distance <= Number(radius);

  // =====================================================
  // ACTIVE SECURITY COUNT
  // =====================================================

  const enabledSecurityCount =
    [
      dynamicQR,
      locationVerification,
      faceVerification,
      duplicateProtection,
    ].filter(Boolean).length;

  // =====================================================
  // HEADER
  // =====================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0e17] text-gray-200">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-blue-600/[0.08] blur-3xl" />

        <div
          className="absolute right-0 top-1/3 h-[28rem] w-[28rem] animate-pulse rounded-full bg-indigo-600/[0.07] blur-3xl"
          style={{
            animationDelay: '1s',
          }}
        />

        <div
          className="absolute bottom-0 left-1/3 h-80 w-80 animate-pulse rounded-full bg-cyan-500/[0.05] blur-3xl"
          style={{
            animationDelay: '2s',
          }}
        />

      </div>

      <DashboardLayout>

        <div className="relative">

          {/* ==================================================
              HEADER
          ================================================== */}

          <header className="mb-8">

            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />

                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
                    Control Center
                  </span>

                </div>

                <h1 className="text-4xl font-black tracking-tight text-white">
                  Settings
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                  Configure your AttendSmart preferences and
                  attendance verification environment.
                </p>

              </div>

              <div className="flex items-center gap-3">

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={17}
                      className="text-emerald-400"
                    />

                    <div>

                      <p className="text-[10px] uppercase tracking-wider text-gray-600">
                        Access
                      </p>

                      <p className="text-xs font-semibold capitalize text-emerald-400">
                        {role || 'Unknown'}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </header>

          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          {message && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">

              <CheckCircle
                size={20}
                className="text-emerald-400"
              />

              <p className="text-sm text-emerald-400">
                {message}
              </p>

            </div>
          )}

          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-4">

              <AlertTriangle
                size={20}
                className="text-red-400"
              />

              <p className="text-sm text-red-400">
                {error}
              </p>

            </div>
          )}

          {/* ==================================================
              ACCOUNT / ROLE
          ================================================== */}

          <div className="mb-5 rounded-[28px] border border-white/[0.06] bg-[#171c27]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

                  <ShieldCheck
                    size={24}
                    className="text-blue-400"
                  />

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">
                    Account Access
                  </p>

                  <h2 className="mt-1 text-xl font-bold capitalize text-white">
                    {role === 'faculty'
                      ? 'Faculty Controls'
                      : role === 'admin'
                      ? 'Administrator Controls'
                      : 'Student Settings'}
                  </h2>

                </div>

              </div>

              {role === 'faculty' && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-500/10 bg-blue-500/[0.04] px-3 py-2">

                  <Radio
                    size={15}
                    className="text-blue-400"
                  />

                  <span className="text-xs text-blue-400">
                    {enabledSecurityCount}/4
                    security controls active
                  </span>

                </div>
              )}

            </div>

          </div>

          {/* ==================================================
              FACULTY SETTINGS
          ================================================== */}

          {role === 'faculty' && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">

              {/* Classroom settings */}
              <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#171c27]/90 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] xl:col-span-8">

                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/[0.06] blur-3xl" />

                <div className="relative">

                  <div className="mb-7 flex items-start justify-between">

                    <div>

                      <div className="flex items-center gap-2">

                        <MapPin
                          size={19}
                          className="text-cyan-400"
                        />

                        <h2 className="text-xl font-bold text-white">
                          Classroom Attendance Zone
                        </h2>

                      </div>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                        Configure the classroom reference location
                        and proximity radius used by attendance
                        verification.
                      </p>

                    </div>

                    <Gauge
                      size={22}
                      className="text-indigo-400"
                    />

                  </div>

                  <form
                    onSubmit={
                      handleSaveClassroom
                    }
                    className="space-y-5"
                  >

                    {/* Classroom name */}
                    <div>

                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Classroom Name
                      </label>

                      <div className="relative">

                        <Building2
                          size={17}
                          className="absolute left-4 top-3.5 text-gray-600"
                        />

                        <input
                          type="text"
                          value={classroom}
                          onChange={(e) =>
                            setClassroom(
                              e.target.value
                            )
                          }
                          placeholder="CSE Room 204"
                          className="w-full rounded-2xl border border-white/[0.06] bg-[#0f141d] py-3.5 pl-11 pr-4 text-sm text-gray-200 outline-none transition focus:border-cyan-500/40"
                        />

                      </div>

                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                      <div>

                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Latitude
                        </label>

                        <input
                          type="number"
                          step="any"
                          value={latitude}
                          onChange={(e) =>
                            setLatitude(
                              e.target.value
                            )
                          }
                          placeholder="22.5726"
                          className="w-full rounded-2xl border border-white/[0.06] bg-[#0f141d] px-4 py-3.5 text-sm text-gray-200 outline-none transition focus:border-cyan-500/40"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Longitude
                        </label>

                        <input
                          type="number"
                          step="any"
                          value={longitude}
                          onChange={(e) =>
                            setLongitude(
                              e.target.value
                            )
                          }
                          placeholder="88.3639"
                          className="w-full rounded-2xl border border-white/[0.06] bg-[#0f141d] px-4 py-3.5 text-sm text-gray-200 outline-none transition focus:border-cyan-500/40"
                        />

                      </div>

                    </div>

                    {/* Current location */}
                    <button
                      type="button"
                      onClick={
                        getCurrentLocation
                      }
                      disabled={
                        loadingLocation
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.05] py-3 text-sm font-semibold text-cyan-400 transition hover:-translate-y-0.5 hover:bg-cyan-500/[0.09] disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <LocateFixed
                        size={17}
                        className={
                          loadingLocation
                            ? 'animate-pulse'
                            : ''
                        }
                      />

                      {loadingLocation
                        ? 'Detecting location...'
                        : 'Use Current Location'}

                    </button>

                    {/* Current location result */}
                    {(currentLatitude ||
                      currentLongitude) && (
                      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">

                        <div className="flex items-center gap-3">

                          <Navigation
                            size={17}
                            className="text-blue-400"
                          />

                          <div>

                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                              Current Device Location
                            </p>

                            <p className="mt-1 text-sm text-gray-300">
                              {currentLatitude},{' '}
                              {currentLongitude}
                            </p>

                          </div>

                        </div>

                      </div>
                    )}

                    {/* Radius */}
                    <div>

                      <div className="mb-3 flex items-center justify-between">

                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Allowed Radius
                        </label>

                        <span className="text-sm font-bold text-cyan-400">
                          {radius} m
                        </span>

                      </div>

                      <input
                        type="range"
                        min="0.5"
                        max="20"
                        step="0.5"
                        value={radius}
                        onChange={(e) =>
                          setRadius(
                            e.target.value
                          )
                        }
                        className="w-full accent-cyan-500"
                      />

                      {/* Quick choices */}
                      <div className="mt-4 flex flex-wrap gap-2">

                        {quickRadii.map(
                          (value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                setRadius(
                                  value
                                )
                              }
                              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                                radius ===
                                value
                                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                                  : 'border-white/[0.05] bg-white/[0.02] text-gray-600 hover:text-gray-300'
                              }`}
                            >
                              {value} m
                            </button>
                          )
                        )}

                      </div>

                      <p className="mt-3 text-xs text-gray-700">
                        Configurable range: 0.5 m – 20 m
                      </p>

                    </div>

                    {/* Test location */}
                    <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.04] p-4">

                      <div className="flex items-center justify-between gap-4">

                        <div>

                          <div className="flex items-center gap-2">

                            <Crosshair
                              size={16}
                              className="text-indigo-400"
                            />

                            <p className="text-sm font-semibold text-white">
                              Test Classroom Zone
                            </p>

                          </div>

                          <p className="mt-1 text-xs leading-5 text-gray-600">
                            Check whether your current device position
                            is inside the configured attendance zone.
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={
                            testLocation
                          }
                          className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-500"
                        >
                          Test
                        </button>

                      </div>

                      {distance !== null && (
                        <div className="mt-4 rounded-xl border border-white/[0.05] bg-black/10 p-4">

                          <div className="flex items-center justify-between">

                            <div>

                              <p className="text-[10px] uppercase tracking-wider text-gray-600">
                                Distance
                              </p>

                              <p className="mt-1 text-xl font-bold text-white">
                                {distance.toFixed(
                                  2
                                )}{' '}
                                m
                              </p>

                            </div>

                            <span
                              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                                isInsideZone
                                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                  : 'border-red-500/20 bg-red-500/10 text-red-400'
                              }`}
                            >
                              {isInsideZone
                                ? 'Inside Zone'
                                : 'Outside Zone'}
                            </span>

                          </div>

                        </div>
                      )}

                    </div>

                    {/* Save / reset */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
                      >

                        <Save size={17} />

                        Save Settings

                      </button>

                      <button
                        type="button"
                        onClick={
                          resetSettings
                        }
                        className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] py-3.5 text-sm font-semibold text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
                      >

                        <RotateCcw
                          size={17}
                        />

                        Reset

                      </button>

                    </div>

                  </form>

                </div>

              </div>

              {/* SECURITY */}
              <div className="space-y-5 xl:col-span-4">

                <div className="rounded-[28px] border border-white/[0.06] bg-[#171c27]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">

                  <div className="flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">

                      <Lock
                        size={21}
                        className="text-indigo-400"
                      />

                    </div>

                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {enabledSecurityCount}/4
                    </span>

                  </div>

                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                    Verification
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-white">
                    Anti-Proxy Controls
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Choose which verification mechanisms should
                    be part of the attendance environment.
                  </p>

                  <div className="mt-6 space-y-3">

                    {/* Dynamic QR */}
                    <button
                      type="button"
                      onClick={() =>
                        setDynamicQR(
                          !dynamicQR
                        )
                      }
                      className="flex w-full items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-left transition hover:bg-white/[0.04]"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">

                          <ScanLine
                            size={17}
                            className="text-blue-400"
                          />

                        </div>

                        <div>

                          <p className="text-sm font-semibold text-white">
                            Dynamic QR
                          </p>

                          <p className="mt-1 text-[10px] text-gray-600">
                            Rotating session QR
                          </p>

                        </div>

                      </div>

                      <div
                        className={`h-6 w-11 rounded-full p-1 transition ${
                          dynamicQR
                            ? 'bg-blue-600'
                            : 'bg-gray-700'
                        }`}
                      >

                        <div
                          className={`h-4 w-4 rounded-full bg-white transition-transform ${
                            dynamicQR
                              ? 'translate-x-5'
                              : ''
                          }`}
                        />

                      </div>

                    </button>

                    {/* Location */}
                    <button
                      type="button"
                      onClick={() =>
                        setLocationVerification(
                          !locationVerification
                        )
                      }
                      className="flex w-full items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-left transition hover:bg-white/[0.04]"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">

                          <MapPin
                            size={17}
                            className="text-cyan-400"
                          />

                        </div>

                        <div>

                          <p className="text-sm font-semibold text-white">
                            Location Check
                          </p>

                          <p className="mt-1 text-[10px] text-gray-600">
                            Classroom proximity
                          </p>

                        </div>

                      </div>

                      <div
                        className={`h-6 w-11 rounded-full p-1 transition ${
                          locationVerification
                            ? 'bg-cyan-600'
                            : 'bg-gray-700'
                        }`}
                      >

                        <div
                          className={`h-4 w-4 rounded-full bg-white transition-transform ${
                            locationVerification
                              ? 'translate-x-5'
                              : ''
                          }`}
                        />

                      </div>

                    </button>

                    {/* Face */}
                    <button
                      type="button"
                      onClick={() =>
                        setFaceVerification(
                          !faceVerification
                        )
                      }
                      className="flex w-full items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-left transition hover:bg-white/[0.04]"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">

                          <Camera
                            size={17}
                            className="text-indigo-400"
                          />

                        </div>

                        <div>

                          <p className="text-sm font-semibold text-white">
                            Face Verification
                          </p>

                          <p className="mt-1 text-[10px] text-gray-600">
                            Identity confirmation
                          </p>

                        </div>

                      </div>

                      <div
                        className={`h-6 w-11 rounded-full p-1 transition ${
                          faceVerification
                            ? 'bg-indigo-600'
                            : 'bg-gray-700'
                        }`}
                      >

                        <div
                          className={`h-4 w-4 rounded-full bg-white transition-transform ${
                            faceVerification
                              ? 'translate-x-5'
                              : ''
                          }`}
                        />

                      </div>

                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() =>
                        setDuplicateProtection(
                          !duplicateProtection
                        )
                      }
                      className="flex w-full items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-left transition hover:bg-white/[0.04]"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">

                          <Smartphone
                            size={17}
                            className="text-emerald-400"
                          />

                        </div>

                        <div>

                          <p className="text-sm font-semibold text-white">
                            Duplicate Protection
                          </p>

                          <p className="mt-1 text-[10px] text-gray-600">
                            Prevent repeated marking
                          </p>

                        </div>

                      </div>

                      <div
                        className={`h-6 w-11 rounded-full p-1 transition ${
                          duplicateProtection
                            ? 'bg-emerald-600'
                            : 'bg-gray-700'
                        }`}
                      >

                        <div
                          className={`h-4 w-4 rounded-full bg-white transition-transform ${
                            duplicateProtection
                              ? 'translate-x-5'
                              : ''
                          }`}
                        />

                      </div>

                    </button>

                  </div>

                  <p className="mt-5 text-[10px] leading-5 text-gray-700">
                    These options currently control the frontend
                    configuration saved on this device.
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* ==================================================
              STUDENT
          ================================================== */}

          {role === 'student' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              <div className="rounded-[28px] border border-white/[0.06] bg-[#171c27]/90 p-7">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">

                  <User
                    size={21}
                    className="text-blue-400"
                  />

                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Account
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  Account Settings
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Your account and academic configuration
                  are controlled by your institution.
                </p>

                <div className="mt-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.04] p-4">

                  <div className="flex gap-3">

                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />

                    <div>

                      <p className="text-sm font-semibold text-white">
                        Account Protected
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-600">
                        Classroom verification settings cannot
                        be modified from a student account.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              <div className="rounded-[28px] border border-white/[0.06] bg-[#171c27]/90 p-7">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">

                  <MapPin
                    size={21}
                    className="text-cyan-400"
                  />

                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Attendance
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  Verification Environment
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Your attendance will use the classroom
                  verification configuration created by authorized faculty.
                </p>

                <div className="mt-6 space-y-3">

                  {[
                    [
                      'Dynamic QR',
                      ScanLine,
                    ],
                    [
                      'Location Check',
                      MapPin,
                    ],
                    [
                      'Face Verification',
                      Camera,
                    ],
                  ].map(
                    ([label, Icon]) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                      >

                        <Icon
                          size={16}
                          className="text-cyan-400"
                        />

                        <span className="text-xs text-gray-500">
                          {label}
                        </span>

                        <span className="ml-auto text-[10px] font-semibold text-emerald-400">
                          Enabled
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ==================================================
              ADMIN
          ================================================== */}

          {role === 'admin' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              <div className="rounded-[28px] border border-white/[0.06] bg-[#171c27]/90 p-7">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">

                  <SettingsIcon
                    size={21}
                    className="text-indigo-400"
                  />

                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Administration
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  System Settings
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Institution-level controls and platform configuration
                  are available to authorized administrators.
                </p>

                <div className="mt-6 rounded-2xl border border-blue-500/10 bg-blue-500/[0.04] p-4">

                  <div className="flex gap-3">

                    <ShieldCheck
                      size={18}
                      className="mt-0.5 text-blue-400"
                    />

                    <div>

                      <p className="text-sm font-semibold text-white">
                        Administrator Access
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-600">
                        You have system-level access to AttendSmart.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              <div className="rounded-[28px] border border-white/[0.06] bg-[#171c27]/90 p-7">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

                  <Gauge
                    size={21}
                    className="text-emerald-400"
                  />

                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Attendance Infrastructure
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  Verification Architecture
                </h2>

                <div className="mt-6 space-y-3">

                  {[
                    'Dynamic QR sessions',
                    'Classroom geofence',
                    'Face verification',
                    'Duplicate protection',
                  ].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                      >

                        <CheckCircle
                          size={15}
                          className="text-emerald-400"
                        />

                        <span className="text-xs text-gray-500">
                          {item}
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>
          )}

        </div>

      </DashboardLayout>
    </div>
  );
};

export default Settings;