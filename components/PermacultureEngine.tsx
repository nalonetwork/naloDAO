'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

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
  const [generating, setGenerating] = useState(false);

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

    setGenerating(true);
    try {
      const stateKey = region.toUpperCase().trim();
      let annualRainfall = "40 inches";
      let calculatedHardiness = "7b";
      let regionalGrants = "";

      // Smart Internal Bioregional Estimator
      if (stateKey === 'AL' || stateKey === 'MS' || stateKey === 'GA') {
        annualRainfall = "56 inches"; 
        calculatedHardiness = "8b / 9a";
        regionalGrants = "• USDA NRCS Environmental Quality Incentives Program (EQIP): Direct cost-share matching available for local organic high-tunnels, cover cropping, and rotational silvopasture setups.\n• State Watershed Management Incentives: Cost matching options for installing sediment retention structures and riparian buffers.";
      } else if (stateKey === 'CA' || stateKey === 'AZ' || stateKey === 'NV') {
        annualRainfall = "14 inches"; 
        calculatedHardiness = "9b / 10a";
        regionalGrants = "• California SWEEP Water Infrastructure Incentives: Offers up to $100,000 for building solar-powered micro-irrigation lines.\n• Desert Conservation cost-shares available through regional BLM and NRCS range assistance programs.";
      } else {
        regionalGrants = "• USDA EQIP Core Track: Standard federal conservation grants available for multi-story orchard transitioning and soil regeneration layouts.";
      }

      const numericalAcres = parseFloat(acres) || 1.0;
      const numericalRainInch = parseFloat(annualRainfall.split(" ")[0]) || 40;
      const computedGallonsHarvestable = Math.round(numericalAcres * numericalRainInch * 27154);

      const escapedAddress = encodeURIComponent(`${address}, ${city}, ${stateKey}, US`);
      const staticMapUrl = GOOGLE_MAPS_API_KEY 
        ? `https://maps.googleapis.com/maps/api/staticmap?center=${escapedAddress}&zoom=18&size=800x400&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`
        : '';

      const { error } = await supabase
        .from('property_designs')
        .insert([{
          property_name: propName,
          street_address: address,
          city: city,
          region_code: stateKey,
          country_code: 'US',
          total_area_acres: numericalAcres,
          estimated_hardiness_zone: calculatedHardiness,
          primary_watershed_basin: `${city} Catchment Basin (Avg Rain: ${annualRainfall} // Est Runoff Capture: ${computedGallonsHarvestable.toLocaleString()} Gal/Yr)`,
          regional_incentives: regionalGrants,
          cached_map_url: staticMapUrl
        }]);

      if (error) throw error;

      alert("Property registry account populated successfully! Design studio is now online. 🌿");
      setPropName(""); setAddress(""); setCity(""); setRegion(""); setAcres("");
      loadDesignData();
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const currentDesign = designs.find(d => d.id === activeDesignId);

  if (loading) return <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 italic p-8">Loading design directory...</div>;

  // =========================================================================
  // 🏛️ DETAILED DESIGN PROFILE VIEW MODULE (SOLANA / STELLAR REDESIGN)
  // =========================================================================
  if (activeDesignId && currentDesign) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-[#0b0f13] rounded-xl border border-slate-800/80 p-5 sm:p-6 space-y-6 backdrop-blur-md text-white mt-4 text-left">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-emerald-400 font-bold">Mollisonian Design Registry</span>
            <h2 className="text-xl sm:text-2xl font-black uppercase font-sans tracking-wide mt-1">{currentDesign.property_name}</h2>
            <p className="text-[11px] font-mono text-slate-500 mt-1">📍 {currentDesign.street_address}, {currentDesign.city}, {currentDesign.region_code}</p>
          </div>
          <button 
            onClick={() => setActiveDesignId(null)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-white transition shadow-md shrink-0"
          >
            ← Back to Directory
          </button>
        </div>

        {/* GOOGLE SATELLITE IMAGE LAYER */}
        <div className="w-full bg-slate-950 rounded-xl border border-slate-900 overflow-hidden shadow-inner group relative">
          {currentDesign.cached_map_url ? (
            <img 
              src={currentDesign.cached_map_url} 
              alt="Property Satellite Frame" 
              className="w-full h-auto object-cover max-h-[350px] opacity-75 group-hover:opacity-100 transition duration-200"
            />
          ) : (
            <div className="p-12 text-center text-xs font-mono text-slate-600 italic space-y-2">
              <p className="uppercase tracking-wider">🌐 Google Satellite Map Viewport Offline</p>
              <p className="text-[9px] text-slate-700 font-bold">Ensure NEXT_PUBLIC_GOOGLE_MAPS_KEY is populated to see live image layouts.</p>
            </div>
          )}
        </div>

        {/* Technical Property Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-left">
          <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl shadow-inner">
            <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-bold mb-1">Total Spatial Scale</span>
            <span className="text-white font-black text-sm">{currentDesign.total_area_acres} Acres</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl shadow-inner">
            <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-bold mb-1">Climate Zone Basis</span>
            <span className="text-white font-black text-sm">USDA Hardiness {currentDesign.estimated_hardiness_zone}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl shadow-inner overflow-hidden">
            <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-bold mb-1">Hydrological Catchment Matrix</span>
            <span className="text-emerald-400 font-black text-xs block truncate mt-0.5">{currentDesign.primary_watershed_basin}</span>
          </div>
        </div>

        {/* INCENTIVES & USDA GRANTS */}
        <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800/80 p-5 rounded-xl space-y-3 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 h-full w-[3px] bg-emerald-500/50" />
          <div className="flex items-center gap-2">
            <span className="text-sm">💵</span>
            <h3 className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">USDA & Local Community Grant Matrix</h3>
          </div>
          <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Governmental funding vectors computed across regional lines:</p>
          <div className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line pl-1 pt-1 font-light">
            {currentDesign.regional_incentives}
          </div>
        </div>

        {/* SECTION 1: MOLLISON SECTOR ANALYSIS */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-mono tracking-widest text-purple-400 font-bold border-b border-slate-800/40 pb-1.5">Mollisonian Sector Analysis (Wild Energy Inputs)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-left">
            <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-1.5 hover:border-slate-800 transition">
              <span className="text-amber-400 font-black block uppercase tracking-wider text-[10px]">☀️ Radiation Sector (Sun Paths)</span>
              <p className="text-slate-300 font-sans font-light leading-relaxed">{currentDesign.sun_path_vectors || "Draft Profile Studio: Edit data model paths to establish solstice trajectory points."}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-1.5 hover:border-slate-800 transition">
              <span className="text-slate-300 font-black block uppercase tracking-wider text-[10px]">💨 Aeolian Sector (Winds)</span>
              <p className="text-slate-300 font-sans font-light leading-relaxed">{currentDesign.prevailing_wind_vectors || "Draft Profile Studio: Edit data model paths to establish microclimatic windbreak parameters."}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-1.5 hover:border-slate-800 transition">
              <span className="text-red-400 font-black block uppercase tracking-wider text-[10px]">🔥 Thermal Risk Sector (Wildfire)</span>
              <p className="text-slate-300 font-sans font-light leading-relaxed">{currentDesign.wildfire_risk_vectors || "Draft Profile Studio: Edit data model paths to configure protective firebreak vegetative bounds."}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-1.5 hover:border-slate-800 transition">
              <span className="text-blue-400 font-black block uppercase tracking-wider text-[10px]">💧 Topographic Gradient (Hydrology Flow)</span>
              <p className="text-slate-300 font-sans font-light leading-relaxed">{currentDesign.hydrological_slope_flow || "Draft Profile Studio: Edit data model paths to calculate keyline swale contour vectors."}</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: THE 6 ECOSYSTEM ZONES */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold border-b border-slate-800/40 pb-1.5">Ecosystem Zones Configuration Profile</h3>
          <div className="space-y-3 font-mono text-xs text-left">
            {[
              { z: 'Zone 0', label: 'The Core Dwelling Structure', text: currentDesign.zone_0_home_base },
              { z: 'Zone 1', label: 'Intensive High-Care Kitchen Gardens', text: currentDesign.zone_1_intensive_garden },
              { z: 'Zone 2', label: 'Semi-Intensive Perennial Food Forest Guilds', text: currentDesign.zone_2_semi_intensive_orchard },
              { z: 'Zone 3', label: 'Main Crop Broadacre Alleys & Grazing Pasture', text: currentDesign.zone_3_main_crop_pasture },
              { z: 'Zone 4', label: 'Semi-Wild Managed Foraging & Biomass Woodlots', text: currentDesign.zone_4_semi_wild_foraging },
              { z: 'Zone 5', label: 'Wild Wilderness Conservation Sanctuary Corridor', text: currentDesign.zone_5_wild_wilderness },
            ].map((zone, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-3 bg-slate-950/40 border border-slate-900 p-4 rounded-xl items-start group hover:border-slate-800 transition relative">
                <div className="absolute left-0 top-0 h-full w-[2px] bg-purple-500/20 group-hover:bg-purple-500/60 transition-all" />
                <span className="px-2 py-0.5 bg-slate-900 text-purple-400 font-black rounded-md text-[9px] tracking-wider shrink-0 border border-slate-800 uppercase">{zone.z}</span>
                <div className="space-y-1">
                  <span className="text-white font-bold block text-[11px] uppercase tracking-wide font-sans">{zone.label}</span>
                  <p className="text-slate-400 font-sans font-light leading-relaxed">{zone.text || "No custom management strategy specified for this design vector quadrant."}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: HOLMGREN SYSTEMIC PRINCIPLES */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-mono tracking-widest text-purple-400 font-bold border-b border-slate-800/40 pb-1.5">Holmgren Design Principle Applications</h3>
          <div className="space-y-3 font-mono text-xs text-left">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1">
              <span className="text-white font-bold block uppercase tracking-wide font-sans text-[11px]">Principle 1: Observe and Interact</span>
              <p className="text-slate-400 font-sans font-light leading-relaxed text-[12px]">{currentDesign.holmgren_directive_1 || "Baseline system check complete. Establish continuous audit observations."}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1">
              <span className="text-white font-bold block uppercase tracking-wide font-sans text-[11px]">Principle 2: Catch and Store Energy</span>
              <p className="text-slate-400 font-sans font-light leading-relaxed text-[12px]">{currentDesign.holmgren_directive_2 || "Baseline water/biomass metrics integrated. Maximize kinetic storage systems."}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1">
              <span className="text-white font-bold block uppercase tracking-wide font-sans text-[11px]">Principle 2: Obtain a Yield</span>
              <p className="text-slate-400 font-sans font-light leading-relaxed text-[12px]">{currentDesign.holmgren_directive_3 || "Direct community commerce enabled. Optimize output-to-input performance yields."}</p>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // =========================================================================
  // 🛒 MAIN DIRECTORY VIEW MODULE (SOLANA / STELLAR REDESIGN)
  // =========================================================================
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 mt-4 text-white">
      
      {/* Structural Form Generator Box */}
      <div className="bg-[#0b0f13] border border-slate-800/80 p-5 rounded-xl shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-purple-600" />
        <div className="text-left">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Register New Ecosystem Site</h3>
          <p className="text-xs text-slate-500 font-light mt-0.5">Input your property coordinates to open a dedicated, local permaculture design framework.</p>
        </div>

        <form onSubmit={handleGenerateDesign} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-2 text-left font-mono text-xs">
          <div className="sm:col-span-6 space-y-1">
            <label className="text-[9px] text-slate-500 uppercase block font-bold px-1 tracking-widest">Site or Farm Name</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus-within:border-emerald-500/60 transition"><input type="text" placeholder="e.g. Oak Haven Sanctuary" value={propName} onChange={e => setPropName(e.target.value)} className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700" /></div>
          </div>
          
          <div className="sm:col-span-6 space-y-1">
            <label className="text-[9px] text-slate-500 uppercase block font-bold px-1 tracking-widest">Total Scale (Acres)</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus-within:border-emerald-500/60 transition"><input type="number" step="0.1" placeholder="e.g. 5.5" value={acres} onChange={e => setAcres(e.target.value)} className="w-full bg-transparent text-white text-xs font-mono focus:outline-none placeholder-slate-700" /></div>
          </div>
          
          <div className="sm:col-span-5 space-y-1">
            <label className="text-[9px] text-slate-500 uppercase block font-bold px-1 tracking-widest">Street Address</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus-within:border-emerald-500/60 transition"><input type="text" placeholder="123 Contour Lane" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700" /></div>
          </div>
          
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[9px] text-slate-500 uppercase block font-bold px-1 tracking-widest">City</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus-within:border-emerald-500/60 transition"><input type="text" placeholder="Foley" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-transparent text-white text-xs font-sans focus:outline-none placeholder-slate-700" /></div>
          </div>
          
          <div className="sm:col-span-3 space-y-1">
            <label className="text-[9px] text-slate-500 uppercase block font-bold px-1 tracking-widest">State Code</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 focus-within:border-emerald-500/60 transition"><input type="text" placeholder="AL" maxLength={2} value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-transparent text-white text-xs font-mono uppercase focus:outline-none placeholder-slate-700 tracking-widest" /></div>
          </div>
          
          <div className="sm:col-span-12 pt-1">
            <button 
              type="submit" 
              disabled={generating}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 disabled:opacity-40 text-slate-950 text-xs font-black uppercase tracking-widest py-3.5 rounded-lg transition hover:brightness-110 shadow-lg"
            >
              {generating ? "Registering Property Hub..." : "Propagate Site Registry Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Directory List of Generated Site Systems */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold border-b border-slate-800/60 pb-2 text-left">Generated Site Frameworks</h4>
        {designs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20 shadow-inner">
            <p className="text-xs text-slate-600 font-mono tracking-wider uppercase">No active site layouts tracked in this registry</p>
          </div>
        ) : (
          <div className="space-y-3">
            {designs.map((design) => (
              <div key={design.id} className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700/80 transition duration-150 backdrop-blur-md shadow-xl text-left relative group">
                <div className="absolute top-0 left-0 w-[2px] h-0 bg-purple-500 group-hover:h-full transition-all duration-200" />
                <div>
                  <h5 className="text-sm font-bold text-white uppercase font-sans tracking-wide leading-none">{design.property_name}</h5>
                  <p className="text-xs text-slate-400 mt-1.5 font-light font-sans">📍 {design.street_address}, {design.city}, {design.region_code}</p>
                  <div className="flex gap-4 text-[9px] font-mono text-slate-500 font-bold uppercase mt-2.5 select-none tracking-wider">
                    <span>Spatial Bounds: <span className="text-slate-400">{design.total_area_acres} Acres</span></span>
                    <span>Hardiness Matrix: <span className="text-slate-400">{design.estimated_hardiness_zone}</span></span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveDesignId(design.id)}
                  className="w-full sm:w-auto bg-slate-900 border border-slate-800/80 hover:border-slate-700 hover:text-emerald-400 text-slate-300 text-xs font-mono px-4 py-2 rounded-lg transition shrink-0 uppercase tracking-wider font-bold h-9 flex items-center justify-center"
                >
                  Open Design Studio →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}