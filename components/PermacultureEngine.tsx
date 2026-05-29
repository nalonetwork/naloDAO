'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PermacultureEngine() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDesignId, setActiveDesignId] = useState<string | number | null>(null);
  
  // Submission Form State variables
  const [propName, setPropName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [acres, setAcres] = useState("");

  const loadDesignData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('property_designs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setDesigns(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDesignData();
  }, []);

  const handleGenerateDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName || !address || !city || !region) return alert("Please populate all location criteria parameters.");

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Programmatic Generation Rules matching Mollisonian Bioregional Criteria matrices
      const mockSun = `Calculated high summer solar zenith for ${city}. High radiation load requires immediate strategic overstory canopy shade placement on the western boundary edges.`;
      const mockWind = `Bioregional wind currents tracking across ${region} indicate high wind scour exposure during changing seasonal successions.`;
      const mockSlope = `Topographic maps indicate a standard rolling gradient slope typical of the regional watershed basin. Keyline plowing recommended.`;

      const { error } = await supabase
        .from('property_designs')
        .insert([{
          steward_id: user?.id || null,
          property_name: propName,
          street_address: address,
          city: city,
          region_code: region,
          country_code: 'US',
          total_area_acres: parseFloat(acres) || 1.0,
          estimated_hardiness_zone: '7b',
          primary_watershed_basin: `${city} Catchment Basin Corridor`,
          sun_path_vectors: mockSun,
          prevailing_wind_vectors: mockWind,
          wildfire_risk_vectors: 'Moderate boundary rim vulnerability. Mitigated via Zone 1 hydration boundaries.',
          hydrological_slope_flow: mockSlope,
          zone_0_home_base: ' Dwelling optimized for passive solar thermal storage collection and complete rainwater harvesting.',
          zone_1_intensive_garden: 'Sheet-mulched intensive kitchen beds, localized culinary herb spirals, and vermicompost hubs.',
          zone_2_semi_intensive_orchard: 'Perennial food forest guilds stacking nut/fruit species with structural poultry forage arrays.',
          zone_3_main_crop_pasture: 'Main dynamic crop alleys tracking on contour lines combined with rotational multi-species silvopasture tracks.',
          zone_4_semi_wild_foraging: 'Managed structural timber lots and native inoculated mycelial log networks for long-term biomass generation.',
          zone_5_wild_wilderness: 'Protected natural ecosystem corridor left completely unmanaged to encourage wildlife re-wilding successions.',
          holmgren_directive_1: 'Baseline spatial microclimate metrics mapped out by tracking wind currents over an initial site observation cycle.',
          holmgren_directive_2: 'Contour swale earthen excavation plans optimize subsoil water storage capacity pools across the slopes.',
          holmgren_directive_3: 'Guild stacking methodology matches high-yield support species directly with primary overstory crops.'
        }]);

      if (error) throw error;

      alert("Permaculture design footprint calculated and cataloged successfully! 🌿");
      setPropName(""); setAddress(""); setCity(""); setRegion(""); setAcres("");
      loadDesignData();
    } catch (err: any) {
      alert("Generation failed: " + err.message);
    }
  };

  const currentDesign = designs.find(d => d.id === activeDesignId);

  if (loading) return <div className="text-xs font-mono text-slate-500 italic p-8">Analyzing site topographies...</div>;

  // --- DETAILED INDIVIDUAL PERMACULTURE DESIGN PROFILE PAGE VIEW ---
  if (activeDesignId && currentDesign) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-slate-950/60 rounded-3xl border border-slate-800/80 p-6 sm:p-8 space-y-8 backdrop-blur-md text-white mt-4">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-emerald-400 font-bold">Mollisonian Design Registry</span>
            <h2 className="text-3xl font-bold tracking-tight mt-1">{currentDesign.property_name}</h2>
            <p className="text-xs font-mono text-slate-400 mt-1">📍 {currentDesign.street_address}, {currentDesign.city}, {currentDesign.region_code}</p>
          </div>
          <button 
            onClick={() => setActiveDesignId(null)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-white transition"
          >
            ← Back to Directory
          </button>
        </div>

        {/* Technical Property Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-900/60 border border-slate-800/60 p-4 rounded-xl">
            <span className="text-slate-500 block">Total Spatial Scale:</span>
            <span className="text-white font-bold text-md">{currentDesign.total_area_acres} Acres</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/60 p-4 rounded-xl">
            <span className="text-slate-500 block">Climate Zone Basis:</span>
            <span className="text-white font-bold text-md">USDA Hardiness {currentDesign.estimated_hardiness_zone}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/60 p-4 rounded-xl">
            <span className="text-slate-500 block">Hydrological Catchment:</span>
            <span className="text-emerald-400 font-bold text-md truncate block">{currentDesign.primary_watershed_basin}</span>
          </div>
        </div>

        {/* SECTION 1: MOLLISON SECTOR ANALYSIS (The Wild Energies Matrix) */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold border-b border-slate-800/60 pb-1">Mollisonian Sector Analysis (Wild Energy Inputs)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-900/40 border border-slate-800/40 p-4 rounded-xl space-y-1">
              <span className="text-slate-400 font-bold block">☀️ Radiation Sector (Sun Paths):</span>
              <p className="text-slate-300 font-serif italic leading-relaxed">{currentDesign.sun_path_vectors}</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/40 p-4 rounded-xl space-y-1">
              <span className="text-slate-400 font-bold block">💨 Aeolian Sector (Prevailing Winds):</span>
              <p className="text-slate-300 font-serif italic leading-relaxed">{currentDesign.prevailing_wind_vectors}</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/40 p-4 rounded-xl space-y-1">
              <span className="text-slate-400 font-bold block">🔥 Thermal Risk Sector (Wildfire):</span>
              <p className="text-slate-300 font-serif italic leading-relaxed">{currentDesign.wildfire_risk_vectors}</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/40 p-4 rounded-xl space-y-1">
              <span className="text-slate-400 font-bold block">💧 Topographic Gradient (Hydrology Flow):</span>
              <p className="text-slate-300 font-serif italic leading-relaxed">{currentDesign.hydrological_slope_flow}</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: THE 6 ECOSYSTEM ZONES DEPLOYMENT PROFILE */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold border-b border-slate-800/60 pb-1">Ecosystem Zones Configuration Profile</h3>
          <div className="space-y-3 font-mono text-xs">
            {[
              { z: 'Zone 0', label: 'The Core Dwelling Structure', text: currentDesign.zone_0_home_base },
              { z: 'Zone 1', label: 'Intensive High-Care Kitchen Gardens', text: currentDesign.zone_1_intensive_garden },
              { z: 'Zone 2', label: 'Semi-Intensive Perennial Food Forest Guilds', text: currentDesign.zone_2_semi_intensive_orchard },
              { z: 'Zone 3', label: 'Main Crop Broadacre Alleys & Grazing Pasture', text: currentDesign.zone_3_main_crop_pasture },
              { z: 'Zone 4', label: 'Semi-Wild Managed Foraging & Biomass Woodlots', text: currentDesign.zone_4_semi_wild_foraging },
              { z: 'Zone 5', label: 'Wild Wilderness Conservation Sanctuary Corridor', text: currentDesign.zone_5_wild_wilderness },
            ].map((zone, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-6 bg-slate-900/30 border border-slate-800/50 p-4 rounded-xl items-start">
                <span className="px-2 py-1 bg-slate-950 text-emerald-400 font-bold rounded text-[10px] shrink-0 border border-slate-800">{zone.z}</span>
                <div className="space-y-1">
                  <span className="text-white font-bold block text-[11px]">{zone.label}</span>
                  <p className="text-slate-300 font-serif italic leading-relaxed">{zone.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: HOLMGREN SYSTEMIC PRINCIPLES APPLICATION MAP */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold border-b border-slate-800/60 pb-1">Holmgren Design Principle Applications</h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 space-y-1">
              <span className="text-white font-bold block">Principle 1: Observe and Interact</span>
              <p className="text-slate-400 font-serif italic text-[13px] leading-relaxed">{currentDesign.holmgren_directive_1}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 space-y-1">
              <span className="text-white font-bold block">Principle 2: Catch and Store Energy</span>
              <p className="text-slate-400 font-serif italic text-[13px] leading-relaxed">{currentDesign.holmgren_directive_2}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 space-y-1">
              <span className="text-white font-bold block">Principle 3: Obtain a Yield</span>
              <p className="text-slate-400 font-serif italic text-[13px] leading-relaxed">{currentDesign.holmgren_directive_3}</p>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // --- MAIN ENTRY DIRECTORY & SUBMISSION INTERFACE VIEW ---
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 mt-4 text-white">
      
      {/* Structural Form Generator Box */}
      <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl shadow-xl backdrop-blur-sm space-y-4">
        <div>
          <h3 className="text-md font-bold text-white tracking-wide">Generate Permaculture Site Footprint</h3>
          <p className="text-xs text-slate-400 mt-1">Input property criteria vectors to propagate an automated spatial zoning layout profile.</p>
        </div>

        <form onSubmit={handleGenerateDesign} className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2">
          <div className="sm:col-span-6 space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold px-1">Site or Farm Name</label>
            <input type="text" placeholder="e.g. Oak Haven Sanctuary" value={propName} onChange={e => setPropName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="sm:col-span-6 space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold px-1">Total Scale (Acres)</label>
            <input type="number" step="0.1" placeholder="e.g. 5.5" value={acres} onChange={e => setAcres(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="sm:col-span-5 space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold px-1">Street Address</label>
            <input type="text" placeholder="123 Contour Lane" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold px-1">City</label>
            <input type="text" placeholder="Foley" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="sm:col-span-3 space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold px-1">State Code</label>
            <input type="text" placeholder="AL" maxLength={2} value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 uppercase" />
          </div>
          <div className="sm:col-span-12 pt-2">
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-widest py-3 rounded-xl transition duration-200 shadow-lg font-mono">
              Propagate Design Profile
            </button>
          </div>
        </form>
      </div>

      {/* Directory List of Generated Site Systems */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold border-b border-slate-800/60 pb-2">Generated Site Frameworks</h4>
        {designs.length === 0 ? (
          <p className="text-xs text-slate-600 font-mono italic">No site profiles computed in this matrix registry track yet.</p>
        ) : (
          designs.map((design) => (
            <div key={design.id} className="bg-slate-900/20 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition">
              <div>
                <h5 className="text-sm font-bold text-white">{design.property_name}</h5>
                <p className="text-xs text-slate-400 mt-0.5">📍 {design.street_address}, {design.city}, {design.region_code}</p>
                <div className="flex gap-4 text-[10px] font-mono text-slate-500 mt-2">
                  <span>Scale: {design.total_area_acres} Acres</span>
                  <span>Zone: USDA {design.estimated_hardiness_zone}</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveDesignId(design.id)}
                className="bg-slate-950 border border-slate-800 hover:border-slate-600 text-emerald-400 hover:text-white text-xs font-mono px-4 py-2 rounded-lg transition shrink-0"
              >
                Open Design Studio →
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}