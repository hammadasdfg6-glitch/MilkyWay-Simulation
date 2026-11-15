import type {
  CameraPreset,
  Landmark,
  ProjectedLandmark,
  SimulationSettings,
  StarCountTier,
  TelemetryStats,
  WavelengthMode,
} from '../types';

export interface HudCallbacks {
  onSettingsChange(partial: Partial<SimulationSettings>): void;
  onSelectLandmark(landmark: Landmark): void;
  onCameraPreset(preset: 'overview' | 'oblique' | 'edge' | 'sol' | 'core'): void;
  onResetView(): void;
}

type SliderSettingKey =
  | 'timeScaleMyrPerSec'
  | 'exposure'
  | 'bloomIntensity'
  | 'dustOpacity'
  | 'nebulaIntensity';

type SwitchSettingKey = 'autoOrbit' | 'followSol' | 'showLandmarks';

const WAVELENGTH_NOTES: Record<WavelengthMode, string> = {
  optical: 'Visible photospheres with Great Rift interstellar dust reddening.',
  infrared: 'JWST/2MASS near-IR penetrates Galactic dust to reveal the hidden bar.',
  ultraviolet: 'GALEX ultraviolet isolates young hot O/B associations along spiral arms.',
  population: 'Diagnostic map: Bulge amber, Arms cyan, Thin white, Thick violet, Halo green.',
};

const PRESET_SHORTCUTS: Record<string, CameraPreset> = {
  '1': 'overview',
  '2': 'oblique',
  '3': 'edge',
  '4': 'sol',
  '5': 'core',
};

let switchPolyfillRequested = false;

function ensureNativeSwitchPolyfill(): void {
  if (switchPolyfillRequested || typeof HTMLInputElement === 'undefined') {
    return;
  }
  switchPolyfillRequested = true;
  if (!('switch' in HTMLInputElement.prototype)) {
    // @ts-expect-error input-switch-polyfill ships ESM JS without TypeScript declarations
    void import('input-switch-polyfill');
  }
}

function createFallbackHudShell(): string {
  return `
    <div class="hud-shell" data-hud-shell>
      <div id="landmark-overlay" class="landmark-overlay" aria-label="3D galactic landmark markers"></div>
      <header class="hud-header glass-panel" data-hud-chrome>
        <div class="header-title-row">
          <h1 class="observatory-title">Milky Way Observatory</h1>
          <span class="galaxy-tag">SBbc</span>
        </div>
        <dl class="telemetry-grid" aria-label="Live observatory telemetry">
          <div class="telemetry-cell"><dt>FPS</dt><dd data-telemetry="fps">--</dd></div>
          <div class="telemetry-cell"><dt>Stars</dt><dd data-telemetry="stars">0.00M</dd></div>
          <div class="telemetry-cell"><dt>Clock</dt><dd data-telemetry="clock">+0.0 Myr</dd></div>
          <div class="telemetry-cell"><dt>Gal R</dt><dd data-telemetry="radius">-- kpc</dd></div>
          <div class="telemetry-cell"><dt>Gal Z</dt><dd data-telemetry="height">-- kpc</dd></div>
          <div class="telemetry-cell"><dt>Sol Dist</dt><dd data-telemetry="sol-dist">-- ly</dd></div>
        </dl>
        <div class="streaming-row" data-streaming-container>
          <div class="streaming-meta">
            <span class="streaming-status" data-telemetry="loading-status">Streaming star catalog…</span>
            <span class="backend-badge" data-telemetry="backend">WebGL2</span>
          </div>
          <progress class="loading-progress" data-telemetry="progress" max="1" value="0" aria-label="Star catalog loading progress"></progress>
        </div>
      </header>
      <article class="landmark-card glass-panel" data-landmark-card data-hud-chrome hidden aria-label="Selected galactic landmark details">
        <div class="card-header">
          <span class="card-category" data-card-category></span>
          <button type="button" class="ghost-btn compact-btn" data-action="close-card">Dismiss</button>
        </div>
        <h2 class="card-title" data-card-title></h2>
        <p class="card-classification" data-card-classification></p>
        <dl class="card-metrics">
          <div class="card-metric"><dt>Sol Distance</dt><dd data-card-distance></dd></div>
          <div class="card-metric"><dt>Galactocentric (X, Y, Z)</dt><dd data-card-coords></dd></div>
        </dl>
        <p class="card-description" data-card-description></p>
        <div class="card-actions">
          <button type="button" class="primary-btn compact-btn" data-action="refocus-landmark">Fly To Landmark</button>
        </div>
      </article>
      <nav class="preset-nav glass-panel" data-hud-chrome aria-label="Camera presets and observatory actions">
        <div class="preset-toolbar" role="toolbar" aria-label="Quick camera presets">
          <button type="button" class="preset-btn" data-preset="overview"><span>Overview</span><kbd>1</kbd></button>
          <button type="button" class="preset-btn" data-preset="oblique"><span>Oblique</span><kbd>2</kbd></button>
          <button type="button" class="preset-btn" data-preset="edge"><span>Edge-On Rift</span><kbd>3</kbd></button>
          <button type="button" class="preset-btn" data-preset="sol"><span>Solar System</span><kbd>4</kbd></button>
          <button type="button" class="preset-btn" data-preset="core"><span>Sgr A* Core</span><kbd>5</kbd></button>
        </div>
        <div class="toolbar-divider" aria-hidden="true"></div>
        <div class="toolbar-actions">
          <button type="button" class="ghost-btn" data-action="reset-view">Reset</button>
          <button type="button" class="ghost-btn" popovertarget="spectral-legend-popover">Legend</button>
          <button type="button" class="ghost-btn" data-action="open-guide"><span>Guide</span><kbd>?</kbd></button>
          <button type="button" class="ghost-btn" data-action="toggle-hud"><span>Hide HUD</span><kbd>H</kbd></button>
          <button type="button" class="ghost-btn" data-action="toggle-drawer" aria-expanded="true" aria-controls="observatory-drawer">Controls</button>
        </div>
      </nav>
      <button type="button" class="hud-restore-pill glass-panel" data-action="restore-hud" hidden><span>Show HUD</span><kbd>H</kbd></button>
      <aside id="observatory-drawer" class="control-drawer glass-panel" data-hud-chrome aria-label="Observatory simulation controls">
        <div class="drawer-header">
          <span class="drawer-title">Observatory Controls</span>
          <button type="button" class="ghost-btn compact-btn" data-action="toggle-drawer">Collapse</button>
        </div>
        <div class="drawer-scroll">
          <details class="control-group" open>
            <summary class="control-summary"><span class="summary-label">Simulation Scale</span><span class="summary-indicator" aria-hidden="true"></span></summary>
            <div class="control-body">
              <fieldset class="segmented-fieldset">
                <legend class="field-legend">Star Count Tier</legend>
                <div class="tier-grid">
                  <label class="segment-option"><input type="radio" name="star-tier" value="500000"><span>500K</span></label>
                  <label class="segment-option"><input type="radio" name="star-tier" value="1000000"><span>1M</span></label>
                  <label class="segment-option"><input type="radio" name="star-tier" value="2000000" checked><span>2M</span></label>
                  <label class="segment-option"><input type="radio" name="star-tier" value="3500000"><span>3.5M</span></label>
                  <label class="segment-option"><input type="radio" name="star-tier" value="5000000"><span>5M</span></label>
                </div>
              </fieldset>
              <div class="slider-control">
                <div class="slider-header"><label for="slider-timescale">Time Warp</label><output for="slider-timescale" data-output="timescale">1.5 Myr/s</output></div>
                <input id="slider-timescale" type="range" min="0" max="15" step="0.1" value="1.5" data-setting="timeScaleMyrPerSec">
              </div>
              <div class="playback-row">
                <button type="button" class="primary-btn playback-btn" data-action="toggle-pause" aria-pressed="false"><span data-pause-label>Pause Simulation</span><kbd>Space</kbd></button>
              </div>
              <div class="switch-list">
                <label class="switch-row" for="switch-auto-orbit"><span>Auto-Orbit Camera</span><input id="switch-auto-orbit" type="checkbox" switch data-setting="autoOrbit"></label>
                <label class="switch-row" for="switch-follow-sol"><span>Follow Sol Orbit</span><input id="switch-follow-sol" type="checkbox" switch data-setting="followSol"></label>
              </div>
            </div>
          </details>
          <details class="control-group" open>
            <summary class="control-summary"><span class="summary-label">Spectral Wavelength</span><span class="summary-indicator" aria-hidden="true"></span></summary>
            <div class="control-body">
              <fieldset class="segmented-fieldset">
                <legend class="field-legend">Observatory Bandpass</legend>
                <div class="wavelength-grid">
                  <label class="segment-option"><input type="radio" name="wavelength" value="optical" checked><span>Optical</span></label>
                  <label class="segment-option"><input type="radio" name="wavelength" value="infrared"><span>Near-IR (JWST)</span></label>
                  <label class="segment-option"><input type="radio" name="wavelength" value="ultraviolet"><span>Ultraviolet</span></label>
                  <label class="segment-option"><input type="radio" name="wavelength" value="population"><span>Population Map</span></label>
                </div>
              </fieldset>
              <p class="bandpass-note" data-wavelength-note></p>
            </div>
          </details>
          <details class="control-group" open>
            <summary class="control-summary"><span class="summary-label">Optics &amp; ISM</span><span class="summary-indicator" aria-hidden="true"></span></summary>
            <div class="control-body">
              <div class="optics-grid">
                <div class="slider-control"><div class="slider-header"><label for="slider-exposure">Exposure</label><output for="slider-exposure" data-output="exposure">1.15 EV</output></div><input id="slider-exposure" type="range" min="0.3" max="3.0" step="0.05" value="1.15" data-setting="exposure"></div>
                <div class="slider-control"><div class="slider-header"><label for="slider-bloom">Bloom Intensity</label><output for="slider-bloom" data-output="bloom">75%</output></div><input id="slider-bloom" type="range" min="0" max="2.0" step="0.05" value="0.75" data-setting="bloomIntensity"></div>
                <div class="slider-control"><div class="slider-header"><label for="slider-dust">Dust Opacity</label><output for="slider-dust" data-output="dust">100%</output></div><input id="slider-dust" type="range" min="0" max="2.5" step="0.05" value="1.0" data-setting="dustOpacity"></div>
                <div class="slider-control"><div class="slider-header"><label for="slider-nebula">H-II Nebula Glow</label><output for="slider-nebula" data-output="nebula">85%</output></div><input id="slider-nebula" type="range" min="0" max="2.5" step="0.05" value="0.85" data-setting="nebulaIntensity"></div>
              </div>
              <div class="switch-list"><label class="switch-row" for="switch-landmarks"><span>Landmark Markers</span><input id="switch-landmarks" type="checkbox" switch checked data-setting="showLandmarks"></label></div>
            </div>
          </details>
          <details class="control-group" open>
            <summary class="control-summary"><span class="summary-label">Galactic Landmarks</span><span class="summary-indicator" aria-hidden="true"></span></summary>
            <div class="control-body">
              <search class="landmark-search"><label class="visually-hidden" for="landmark-filter">Filter galactic landmarks</label><input id="landmark-filter" type="search" placeholder="Filter nebulae, clusters, core…" autocomplete="off" data-landmark-search></search>
              <ul class="landmark-list" data-landmark-list aria-label="Galactic landmarks directory"></ul>
            </div>
          </details>
        </div>
      </aside>
      <section id="spectral-legend-popover" popover="auto" class="legend-popover glass-panel" aria-labelledby="legend-popover-title">
        <div class="popover-header"><h2 id="legend-popover-title">Spectral &amp; Population Key</h2><button type="button" class="ghost-btn compact-btn" popovertarget="spectral-legend-popover" popovertargetaction="hide">Close</button></div>
      </section>
      <dialog id="astrophysics-dialog" class="help-dialog glass-panel" closedby="any" aria-labelledby="astrophysics-dialog-title">
        <form method="dialog" class="dialog-header"><h2 id="astrophysics-dialog-title">Milky Way Astrophysics &amp; Navigation</h2><button type="submit" class="ghost-btn compact-btn">Close</button></form>
        <div class="dialog-body"><p>Milky Way Observatory WebGL2 Simulation.</p></div>
      </dialog>
      <section class="error-banner glass-panel" data-error-banner role="alert" hidden>
        <h2>Observatory Renderer Unavailable</h2>
        <p data-error-message></p>
      </section>
    </div>
  `;
}

export class ObservatoryHud {
  private readonly root: HTMLElement;
  private readonly landmarks: Landmark[];
  private readonly callbacks: HudCallbacks;
  private readonly abortController = new AbortController();

  private settings: SimulationSettings;
  private selectedLandmark: Landmark | null = null;
  private hudHidden = false;
  private drawerCollapsed = false;
  private activeFilter = '';

  private readonly shellEl: HTMLElement;
  private readonly overlayEl: HTMLElement;
  private readonly restorePillEl: HTMLButtonElement;
  private readonly helpDialogEl: HTMLDialogElement;
  private readonly errorBannerEl: HTMLElement;
  private readonly errorMessageEl: HTMLElement;

  private readonly fpsEl: HTMLElement;
  private readonly starsEl: HTMLElement;
  private readonly clockEl: HTMLElement;
  private readonly radiusEl: HTMLElement;
  private readonly heightEl: HTMLElement;
  private readonly solDistEl: HTMLElement;
  private readonly loadingStatusEl: HTMLElement;
  private readonly backendEl: HTMLElement;
  private readonly streamingContainerEl: HTMLElement;
  private readonly progressEl: HTMLProgressElement;

  private readonly pauseButtonEl: HTMLButtonElement;
  private readonly pauseLabelEl: HTMLElement;
  private readonly wavelengthNoteEl: HTMLElement;
  private readonly drawerToggleButtons: HTMLButtonElement[];
  private readonly presetButtons: HTMLButtonElement[];

  private readonly landmarkSearchEl: HTMLInputElement;
  private readonly landmarkListEl: HTMLUListElement;
  private readonly landmarkCardEl: HTMLElement;
  private readonly cardCategoryEl: HTMLElement;
  private readonly cardTitleEl: HTMLElement;
  private readonly cardClassificationEl: HTMLElement;
  private readonly cardDistanceEl: HTMLElement;
  private readonly cardCoordsEl: HTMLElement;
  private readonly cardDescriptionEl: HTMLElement;

  private readonly tierRadios: HTMLInputElement[];
  private readonly wavelengthRadios: HTMLInputElement[];
  private readonly sliderInputs = new Map<SliderSettingKey, HTMLInputElement>();
  private readonly sliderOutputs = new Map<SliderSettingKey, HTMLOutputElement>();
  private readonly switchInputs = new Map<SwitchSettingKey, HTMLInputElement>();
  private readonly pinElements = new Map<string, HTMLButtonElement>();
  private readonly directoryButtons = new Map<string, HTMLButtonElement>();

  constructor(
    root: HTMLElement,
    landmarks: Landmark[],
    initialSettings: SimulationSettings,
    callbacks: HudCallbacks
  ) {
    ensureNativeSwitchPolyfill();

    this.root = root;
    this.landmarks = landmarks;
    this.settings = { ...initialSettings };
    this.callbacks = callbacks;

    if (!this.root.querySelector('[data-hud-shell]')) {
      this.root.innerHTML = createFallbackHudShell();
    }

    this.shellEl = this.requireElement('[data-hud-shell]');
    this.overlayEl = this.requireElement('#landmark-overlay');
    this.restorePillEl = this.requireElement('[data-action="restore-hud"]');
    this.helpDialogEl = this.requireElement('#astrophysics-dialog');
    this.errorBannerEl = this.requireElement('[data-error-banner]');
    this.errorMessageEl = this.requireElement('[data-error-message]');

    this.fpsEl = this.requireElement('[data-telemetry="fps"]');
    this.starsEl = this.requireElement('[data-telemetry="stars"]');
    this.clockEl = this.requireElement('[data-telemetry="clock"]');
    this.radiusEl = this.requireElement('[data-telemetry="radius"]');
    this.heightEl = this.requireElement('[data-telemetry="height"]');
    this.solDistEl = this.requireElement('[data-telemetry="sol-dist"]');
    this.loadingStatusEl = this.requireElement('[data-telemetry="loading-status"]');
    this.backendEl = this.requireElement('[data-telemetry="backend"]');
    this.streamingContainerEl = this.requireElement('[data-streaming-container]');
    this.progressEl = this.requireElement('[data-telemetry="progress"]');

    this.pauseButtonEl = this.requireElement('[data-action="toggle-pause"]');
    this.pauseLabelEl = this.requireElement('[data-pause-label]');
    this.wavelengthNoteEl = this.requireElement('[data-wavelength-note]');
    this.drawerToggleButtons = Array.from(
      this.shellEl.querySelectorAll<HTMLButtonElement>('[data-action="toggle-drawer"]')
    );
    this.presetButtons = Array.from(
      this.shellEl.querySelectorAll<HTMLButtonElement>('[data-preset]')
    );

    this.landmarkSearchEl = this.requireElement('[data-landmark-search]');
    this.landmarkListEl = this.requireElement('[data-landmark-list]');
    this.landmarkCardEl = this.requireElement('[data-landmark-card]');
    this.cardCategoryEl = this.requireElement('[data-card-category]');
    this.cardTitleEl = this.requireElement('[data-card-title]');
    this.cardClassificationEl = this.requireElement('[data-card-classification]');
    this.cardDistanceEl = this.requireElement('[data-card-distance]');
    this.cardCoordsEl = this.requireElement('[data-card-coords]');
    this.cardDescriptionEl = this.requireElement('[data-card-description]');

    this.tierRadios = Array.from(
      this.shellEl.querySelectorAll<HTMLInputElement>('input[name="star-tier"]')
    );
    this.wavelengthRadios = Array.from(
      this.shellEl.querySelectorAll<HTMLInputElement>('input[name="wavelength"]')
    );

    this.indexSlidersAndSwitches();
    this.renderLandmarkDirectory();
    this.bindEvents();
    this.syncSettings(this.settings);
  }

  public updateTelemetry(stats: TelemetryStats): void {
    this.fpsEl.textContent = stats.fps > 0 ? String(Math.round(stats.fps)) : '--';
    this.starsEl.textContent = `${(stats.activeStars / 1_000_000).toFixed(2)}M`;
    const sign = stats.simTimeMyr >= 0 ? '+' : '';
    this.clockEl.textContent = `${sign}${stats.simTimeMyr.toFixed(1)} Myr`;
    this.radiusEl.textContent = `${stats.cameraRadiusKpc.toFixed(2)} kpc`;
    const zSign = stats.cameraHeightKpc >= 0 ? '+' : '';
    this.heightEl.textContent = `${zSign}${stats.cameraHeightKpc.toFixed(2)} kpc`;
    this.solDistEl.textContent = this.formatSolDistance(stats.cameraDistFromSolLy);
    this.backendEl.textContent = stats.webglBackend || 'WebGL2';

    const byCounts =
      stats.targetStars > 0
        ? Math.max(0, Math.min(1, stats.loadedStars / stats.targetStars))
        : 1;
    const rawProgress =
      stats.loadingProgress > 1
        ? stats.loadingProgress / 100
        : stats.loadingProgress;
    const progress =
      stats.targetStars > 0
        ? byCounts
        : Math.max(
            0,
            Math.min(1, Number.isFinite(rawProgress) ? rawProgress : 1)
          );
    const isComplete =
      progress >= 0.999 ||
      (stats.targetStars > 0 && stats.loadedStars >= stats.targetStars);

    this.progressEl.value = isComplete ? 1 : progress;
    this.streamingContainerEl.dataset.complete = isComplete ? 'true' : 'false';

    if (isComplete) {
      this.loadingStatusEl.textContent = `${(stats.loadedStars / 1_000_000).toFixed(2)}M stars streamed`;
    } else {
      const loadedM = (stats.loadedStars / 1_000_000).toFixed(2);
      const targetM = (stats.targetStars / 1_000_000).toFixed(2);
      this.loadingStatusEl.textContent = `Streaming ${loadedM}M / ${targetM}M (${Math.round(progress * 100)}%)`;
    }
  }

  public updateProjectedLandmarks(projected: ProjectedLandmark[]): void {
    if (!this.settings.showLandmarks || this.hudHidden) {
      for (const pin of this.pinElements.values()) {
        pin.hidden = true;
      }
      return;
    }

    const seenIds = new Set<string>();
    for (const item of projected) {
      const { landmark, screenX, screenY, visible } = item;
      seenIds.add(landmark.id);
      const pin = this.getOrCreatePin(landmark);

      if (!visible || !Number.isFinite(screenX) || !Number.isFinite(screenY)) {
        pin.hidden = true;
        continue;
      }

      pin.hidden = false;
      pin.style.setProperty('--pin-x', `${screenX.toFixed(1)}px`);
      pin.style.setProperty('--pin-y', `${screenY.toFixed(1)}px`);
      pin.dataset.selected =
        this.selectedLandmark?.id === landmark.id ? 'true' : 'false';
    }

    for (const [id, pin] of this.pinElements) {
      if (!seenIds.has(id)) {
        pin.hidden = true;
      }
    }
  }

  public syncSettings(settings: SimulationSettings): void {
    this.settings = { ...settings };

    for (const radio of this.tierRadios) {
      radio.checked = Number(radio.value) === settings.starCountTier;
    }

    for (const radio of this.wavelengthRadios) {
      radio.checked = radio.value === settings.wavelength;
    }
    this.wavelengthNoteEl.textContent = WAVELENGTH_NOTES[settings.wavelength];

    this.syncRangeElement('timeScaleMyrPerSec', settings.timeScaleMyrPerSec);
    this.syncRangeElement('exposure', settings.exposure);
    this.syncRangeElement('bloomIntensity', settings.bloomIntensity);
    this.syncRangeElement('dustOpacity', settings.dustOpacity);
    this.syncRangeElement('nebulaIntensity', settings.nebulaIntensity);

    this.syncSwitchElement('autoOrbit', settings.autoOrbit);
    this.syncSwitchElement('followSol', settings.followSol);
    this.syncSwitchElement('showLandmarks', settings.showLandmarks);

    this.pauseButtonEl.setAttribute('aria-pressed', String(settings.paused));
    this.pauseLabelEl.textContent = settings.paused
      ? 'Resume Simulation'
      : 'Pause Simulation';

    if (!settings.showLandmarks) {
      for (const pin of this.pinElements.values()) {
        pin.hidden = true;
      }
    }
  }

  public showError(message: string): void {
    this.errorMessageEl.textContent = message;
    this.errorBannerEl.hidden = false;
    this.loadingStatusEl.textContent = 'Renderer initialization failed';
    this.streamingContainerEl.dataset.complete = 'true';
  }

  public dispose(): void {
    this.abortController.abort();
    this.overlayEl.replaceChildren();
    this.pinElements.clear();
    this.directoryButtons.clear();
  }

  private requireElement<T extends Element>(selector: string): T {
    const el = this.root.querySelector<T>(selector);
    if (!el) {
      throw new Error(`ObservatoryHud missing required element: ${selector}`);
    }
    return el;
  }

  private indexSlidersAndSwitches(): void {
    const sliderKeys: SliderSettingKey[] = [
      'timeScaleMyrPerSec',
      'exposure',
      'bloomIntensity',
      'dustOpacity',
      'nebulaIntensity',
    ];

    for (const key of sliderKeys) {
      const input = this.shellEl.querySelector<HTMLInputElement>(
        `input[type="range"][data-setting="${key}"]`
      );
      if (input) {
        this.sliderInputs.set(key, input);
        const output = this.shellEl.querySelector<HTMLOutputElement>(
          `output[for="${input.id}"]`
        );
        if (output) {
          this.sliderOutputs.set(key, output);
        }
      }
    }

    const switchKeys: SwitchSettingKey[] = [
      'autoOrbit',
      'followSol',
      'showLandmarks',
    ];
    for (const key of switchKeys) {
      const input = this.shellEl.querySelector<HTMLInputElement>(
        `input[type="checkbox"][data-setting="${key}"]`
      );
      if (input) {
        this.switchInputs.set(key, input);
      }
    }
  }

  private bindEvents(): void {
    const { signal } = this.abortController;

    for (const radio of this.tierRadios) {
      radio.addEventListener(
        'change',
        () => {
          if (!radio.checked) return;
          const starCountTier = Number(radio.value) as StarCountTier;
          this.settings.starCountTier = starCountTier;
          this.callbacks.onSettingsChange({ starCountTier });
        },
        { signal }
      );
    }

    for (const radio of this.wavelengthRadios) {
      radio.addEventListener(
        'change',
        () => {
          if (!radio.checked) return;
          const wavelength = radio.value as WavelengthMode;
          this.settings.wavelength = wavelength;
          this.wavelengthNoteEl.textContent = WAVELENGTH_NOTES[wavelength];
          this.callbacks.onSettingsChange({ wavelength });
        },
        { signal }
      );
    }

    for (const [key, input] of this.sliderInputs) {
      input.addEventListener(
        'input',
        () => {
          const numeric = Number(input.value);
          this.syncRangeElement(key, numeric);
          this.settings[key] = numeric;
          this.callbacks.onSettingsChange({ [key]: numeric });
        },
        { signal }
      );
    }

    for (const [key, input] of this.switchInputs) {
      input.addEventListener(
        'change',
        () => {
          const checked = input.checked;
          this.settings[key] = checked;
          if (key === 'showLandmarks' && !checked) {
            for (const pin of this.pinElements.values()) {
              pin.hidden = true;
            }
          }
          this.callbacks.onSettingsChange({ [key]: checked });
        },
        { signal }
      );
    }

    this.pauseButtonEl.addEventListener(
      'click',
      () => this.togglePaused(),
      { signal }
    );

    for (const btn of this.presetButtons) {
      btn.addEventListener(
        'click',
        () => {
          const preset = btn.dataset.preset as CameraPreset | undefined;
          if (preset) {
            this.triggerCameraPreset(preset);
          }
        },
        { signal }
      );
    }

    const resetBtn = this.shellEl.querySelector<HTMLButtonElement>(
      '[data-action="reset-view"]'
    );
    resetBtn?.addEventListener(
      'click',
      () => {
        this.clearPresetHighlight();
        this.callbacks.onResetView();
      },
      { signal }
    );

    const openGuideBtn = this.shellEl.querySelector<HTMLButtonElement>(
      '[data-action="open-guide"]'
    );
    openGuideBtn?.addEventListener(
      'click',
      () => this.openHelpDialog(),
      { signal }
    );

    const hideHudBtn = this.shellEl.querySelector<HTMLButtonElement>(
      '[data-action="toggle-hud"]'
    );
    hideHudBtn?.addEventListener(
      'click',
      () => this.setHudHidden(true),
      { signal }
    );

    this.restorePillEl.addEventListener(
      'click',
      () => this.setHudHidden(false),
      { signal }
    );

    for (const btn of this.drawerToggleButtons) {
      btn.addEventListener(
        'click',
        () => this.setDrawerCollapsed(!this.drawerCollapsed),
        { signal }
      );
    }

    this.landmarkSearchEl.addEventListener(
      'input',
      () => {
        this.activeFilter = this.landmarkSearchEl.value.trim().toLowerCase();
        this.renderLandmarkDirectory();
      },
      { signal }
    );

    const closeCardBtn = this.shellEl.querySelector<HTMLButtonElement>(
      '[data-action="close-card"]'
    );
    closeCardBtn?.addEventListener(
      'click',
      () => {
        this.selectedLandmark = null;
        this.landmarkCardEl.hidden = true;
        this.syncSelectedLandmarkStates();
      },
      { signal }
    );

    const refocusBtn = this.shellEl.querySelector<HTMLButtonElement>(
      '[data-action="refocus-landmark"]'
    );
    refocusBtn?.addEventListener(
      'click',
      () => {
        if (this.selectedLandmark) {
          this.callbacks.onSelectLandmark(this.selectedLandmark);
        }
      },
      { signal }
    );

    this.helpDialogEl.addEventListener(
      'click',
      (event) => {
        if (event.target === this.helpDialogEl) {
          this.helpDialogEl.close();
        }
      },
      { signal }
    );

    window.addEventListener(
      'keydown',
      (event) => this.handleKeyDown(event),
      { signal }
    );
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const isTextEntry =
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable === true ||
      (target instanceof HTMLInputElement &&
        target.type !== 'range' &&
        target.type !== 'checkbox' &&
        target.type !== 'radio');

    if (isTextEntry) {
      return;
    }

    if (event.key === '?' && !this.helpDialogEl.open) {
      event.preventDefault();
      this.openHelpDialog();
      return;
    }

    if (this.helpDialogEl.open) {
      return;
    }

    if (event.key === 'h' || event.key === 'H') {
      event.preventDefault();
      this.setHudHidden(!this.hudHidden);
      return;
    }

    const preset = PRESET_SHORTCUTS[event.key];
    if (preset) {
      event.preventDefault();
      this.triggerCameraPreset(preset);
      return;
    }

    if (event.code === 'Space') {
      const isNativeActivatable =
        target instanceof HTMLButtonElement ||
        target instanceof HTMLAnchorElement ||
        target?.tagName === 'SUMMARY' ||
        (target instanceof HTMLInputElement &&
          (target.type === 'checkbox' || target.type === 'radio'));
      if (isNativeActivatable) {
        return;
      }
      event.preventDefault();
      this.togglePaused();
    }
  }

  private togglePaused(): void {
    const paused = !this.settings.paused;
    this.settings.paused = paused;
    this.pauseButtonEl.setAttribute('aria-pressed', String(paused));
    this.pauseLabelEl.textContent = paused
      ? 'Resume Simulation'
      : 'Pause Simulation';
    this.callbacks.onSettingsChange({ paused });
  }

  private triggerCameraPreset(preset: CameraPreset): void {
    for (const btn of this.presetButtons) {
      btn.dataset.active = btn.dataset.preset === preset ? 'true' : 'false';
    }
    this.callbacks.onCameraPreset(preset);
  }

  private clearPresetHighlight(): void {
    for (const btn of this.presetButtons) {
      btn.dataset.active = 'false';
    }
  }

  private setHudHidden(hidden: boolean): void {
    this.hudHidden = hidden;
    this.shellEl.dataset.hudHidden = hidden ? 'true' : 'false';
    this.restorePillEl.hidden = !hidden;
    if (hidden) {
      for (const pin of this.pinElements.values()) {
        pin.hidden = true;
      }
      const popover = this.shellEl.querySelector<HTMLElement>(
        '#spectral-legend-popover'
      );
      if (popover && 'hidePopover' in popover) {
        try {
          (popover as HTMLElement & { hidePopover(): void }).hidePopover();
        } catch {
          // Ignore if popover is not currently open in top layer
        }
      }
    }
  }

  private setDrawerCollapsed(collapsed: boolean): void {
    this.drawerCollapsed = collapsed;
    this.shellEl.dataset.drawerCollapsed = collapsed ? 'true' : 'false';
    for (const btn of this.drawerToggleButtons) {
      if (btn.hasAttribute('aria-expanded')) {
        btn.setAttribute('aria-expanded', String(!collapsed));
      }
    }
  }

  private openHelpDialog(): void {
    if (!this.helpDialogEl.open) {
      this.helpDialogEl.showModal();
    }
  }

  private selectLandmark(landmark: Landmark): void {
    this.selectedLandmark = landmark;
    this.clearPresetHighlight();
    this.syncSelectedLandmarkStates();

    this.cardCategoryEl.textContent = landmark.category;
    this.cardTitleEl.textContent = landmark.name;
    this.cardClassificationEl.textContent = landmark.classification;
    this.cardDistanceEl.textContent = landmark.distanceFromSolLy;
    const [x, y, z] = landmark.positionKpc;
    this.cardCoordsEl.textContent = `${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)} kpc`;
    this.cardDescriptionEl.textContent = landmark.description;
    this.landmarkCardEl.hidden = false;

    this.callbacks.onSelectLandmark(landmark);
  }

  private syncSelectedLandmarkStates(): void {
    const selectedId = this.selectedLandmark?.id ?? '';
    for (const [id, btn] of this.directoryButtons) {
      btn.dataset.selected = id === selectedId ? 'true' : 'false';
    }
    for (const [id, pin] of this.pinElements) {
      pin.dataset.selected = id === selectedId ? 'true' : 'false';
    }
  }

  private renderLandmarkDirectory(): void {
    this.landmarkListEl.replaceChildren();
    this.directoryButtons.clear();

    const filtered = this.activeFilter
      ? this.landmarks.filter((lm) => {
          const haystack = `${lm.name} ${lm.classification} ${lm.category} ${lm.description}`.toLowerCase();
          return haystack.includes(this.activeFilter);
        })
      : this.landmarks;

    if (filtered.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'landmark-empty';
      emptyItem.textContent = 'No matching galactic landmarks.';
      this.landmarkListEl.appendChild(emptyItem);
      return;
    }

    for (const landmark of filtered) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'landmark-item-btn';
      btn.dataset.landmarkId = landmark.id;
      btn.dataset.selected =
        this.selectedLandmark?.id === landmark.id ? 'true' : 'false';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'landmark-item-name';
      nameSpan.textContent = landmark.name;

      const distSpan = document.createElement('span');
      distSpan.className = 'landmark-item-dist';
      distSpan.textContent = landmark.distanceFromSolLy;

      btn.append(nameSpan, distSpan);
      btn.addEventListener(
        'click',
        () => this.selectLandmark(landmark),
        { signal: this.abortController.signal }
      );

      li.appendChild(btn);
      this.landmarkListEl.appendChild(li);
      this.directoryButtons.set(landmark.id, btn);
    }
  }

  private getOrCreatePin(landmark: Landmark): HTMLButtonElement {
    const existing = this.pinElements.get(landmark.id);
    if (existing) {
      return existing;
    }

    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'landmark-pin';
    pin.dataset.landmarkId = landmark.id;
    pin.dataset.category = landmark.category;
    pin.hidden = true;

    const label = document.createElement('span');
    label.textContent = landmark.name;
    pin.appendChild(label);

    pin.addEventListener(
      'click',
      () => this.selectLandmark(landmark),
      { signal: this.abortController.signal }
    );

    this.overlayEl.appendChild(pin);
    this.pinElements.set(landmark.id, pin);
    return pin;
  }

  private syncRangeElement(key: SliderSettingKey, value: number): void {
    const input = this.sliderInputs.get(key);
    if (!input) {
      return;
    }
    input.value = String(value);
    input.style.setProperty('--attr-min', input.min || '0');
    input.style.setProperty('--attr-max', input.max || '100');
    input.style.setProperty('--control-value', input.value);

    const formatted = this.formatSliderValue(key, value);
    input.setAttribute('aria-valuetext', formatted.ariaText);

    const outputEl = this.sliderOutputs.get(key);
    if (outputEl) {
      outputEl.textContent = formatted.displayText;
    }
  }

  private syncSwitchElement(key: SwitchSettingKey, checked: boolean): void {
    const input = this.switchInputs.get(key);
    if (input) {
      input.checked = checked;
    }
  }

  private formatSliderValue(
    key: SliderSettingKey,
    value: number
  ): { displayText: string; ariaText: string } {
    switch (key) {
      case 'timeScaleMyrPerSec':
        return {
          displayText: `${value.toFixed(1)} Myr/s`,
          ariaText: `${value.toFixed(1)} million years per second`,
        };
      case 'exposure':
        return {
          displayText: `${value.toFixed(2)} EV`,
          ariaText: `${value.toFixed(2)} exposure value`,
        };
      case 'bloomIntensity': {
        const pct = Math.round(value * 100);
        return {
          displayText: `${pct}%`,
          ariaText: `${pct} percent bloom intensity`,
        };
      }
      case 'dustOpacity': {
        const pct = Math.round(value * 100);
        return {
          displayText: `${pct}%`,
          ariaText: `${pct} percent interstellar dust opacity`,
        };
      }
      case 'nebulaIntensity': {
        const pct = Math.round(value * 100);
        return {
          displayText: `${pct}%`,
          ariaText: `${pct} percent H-II nebula glow`,
        };
      }
    }
  }

  private formatSolDistance(distLy: number): string {
    if (!Number.isFinite(distLy) || distLy < 0) {
      return '-- ly';
    }
    if (distLy < 1000) {
      return `${distLy.toFixed(1)} ly`;
    }
    if (distLy < 100_000) {
      return `${Math.round(distLy).toLocaleString('en-US')} ly`;
    }
    return `${(distLy / 1000).toFixed(1)}k ly`;
  }
}
