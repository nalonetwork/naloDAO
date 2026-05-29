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

      // Generate a static re-usable Google Maps URL link
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

  if (loading) return <div className="text-xs font-mono text-slate-500 italic p-8">Loading design directory...</div>;

  // --- DETAILED PROFILE PAGE VIEW ---
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

        {/* GOOGLE SATELLITE IMAGE LAYER */}
        <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-inner group relative">
          {currentDesign.cached_map_url ? (
            <img 
              src={currentDesign.cached_map_url} 
              alt="Property Satellite Frame" 
              className="w-full h-auto object-cover max-h-[350px] opacity-80 group-hover:opacity-100 transition duration-300"
            />
          ) : (
            <div className="p-12 text-center text-xs font-mono text-slate-500 italic space-y-1">
              <p>🌐 Google Satellite Map Viewport Placeholder</p>
              <p className="text-[10px] text-slate-600">Ensure NEXT_PUBLIC_GOOGLE_MAPS_KEY is populated to see live image layouts.</p>
            </div>
          )}
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
            <span className="text-slate-500 block">Hydrological Catchment & Rainfall:</span>
            <span className="text-emerald-400 font-bold text-md truncate block">{currentDesign.primary_watershed_basin}</span>
          </div>
        </div>

        {/* INCENTIVES & USDA GRANTS */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20 border border-emerald-500/20 p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-md">💵</span>
            <h3 className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-black">USDA & Local Community Grant Matrix</h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Governmental funding vectors calculated based on matching state conservation parameters:</p>
          <div className="text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed pl-1 pt-1">
            {currentDesign.regional_incentives}
          </div>
        </div>

        {/* SECTION 1: MOLLISON SECTOR ANALYSIS */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold border-b border-slate-800/60 pb-1">Mollisonian Sector Analysis (Wild Energy Inputs)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-900/40 border border-slate-800/40 p-4 rounded-xl space-y-1">
              <span className="text-slate-400 font-bold block">☀️ Radiation Sector (Sun Paths):</span>
              <p className="text-slate-300 font-serif italic leading-relaxed">{currentDesign.sun_path_vectors}</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/40 p-4 rounded-xl space-y-1">
              <span className="text-slate-400 font-bold block">💨 Aeolian Sector (Winds):</span>
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

        {/* SECTION 2: THE 6 ECOSYSTEM ZONES */}
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

        {/* SECTION 3: HOLMGREN SYSTEMIC PRINCIPLES */}
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

  // --- MAIN ENTRY DIRECTORY VIEW ---
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 mt-4 text-white">
      
      {/* Structural Form Generator Box */}
      <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl shadow-xl backdrop-blur-sm space-y-4">
        <div>
          <h3 className="text-md font-bold text-white tracking-wide">Register New Ecosystem Site</h3>
          <p className="text-xs text-slate-400 mt-1">Input your property coordinates to open a dedicated, local permaculture design framework.</p>
        </div>

        <form onSubmit={handleGenerateDesign} className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2">
          <div className="sm:col-span-6 space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold px-1">Site or Farm Name</label>
            <input 
              type="text" 
              placeholder="e.g. Oak Haven Sanctuary" 
              value={propName} 
              onChange={e => setPropName(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500" 
            />
          </div>
          
          <div className="sm:col-span-6 space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold px-1">Total Scale (Acres)</label>
            <input 
              type="number" 
              step="0.1" 
              placeholder="e.g. 5.5" 
              value={acres} 
              onChange={e => setAcres(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500" 
            />
          </div>
          
          <div className="sm:col-span-5 space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold px-1">Street Address</label>
            <input 
              type="text" 
              placeholder="123 Contour Lane" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500" 
            />
          </div>
          
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold px-1">City</label>
            <input 
              type="text" 
              placeholder="Foley" 
              value={city} 
              onChange={e => setCity(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500" 
            />
          </div>
          
          <div className="sm:col-span-3 space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold px-1">State Code</label>
            <input 
              type="text" 
              placeholder="AL" 
              maxLength={2} 
              value={region} 
              onChange={e => setRegion(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 uppercase" 
            />
          </div>
          
          <div className="sm:col-span-12 pt-2">
            <button 
              type="submit" 
              disabled={generating}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800/40 text-slate-950 text-xs font-black uppercase tracking-widest py-3 rounded-xl transition duration-200 shadow-lg font-mono"
            >
              {generating ? "Registering Property Hub..." : "Propagate Site Registry Profile"}
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
                  <span>Zone: {design.estimated_hardiness_zone}</span>
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