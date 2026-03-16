import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Nav from "@/components/Nav";
import StepProgress from "@/components/StepProgress";
import ListingCard from "@/components/ListingCard";
import { vilniusDistricts, mockCurrentUser } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Home, Search, Camera } from "lucide-react";
import type { Listing } from "@/data/mockData";

const CreateListing = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const steps = ["Type & basics", "Details", "Photos", "Preview & publish"];

  // Step 1
  const [type, setType] = useState<"offering" | "seeking" | null>(null);
  const [title, setTitle] = useState("");
  const [district, setDistrict] = useState("");
  const [price, setPrice] = useState("");
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);

  // Step 2
  const [description, setDescription] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [genderPref, setGenderPref] = useState<"any" | "male" | "female">("any");
  const [smoking, setSmoking] = useState(false);
  const [pets, setPets] = useState(false);

  // Step 3
  const [photos, setPhotos] = useState<string[]>([]);

  const [publishing, setPublishing] = useState(false);

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  const addMockPhoto = () => {
    if (photos.length >= 6) return;
    const id = Math.floor(Math.random() * 100) + 200;
    setPhotos([...photos, `https://picsum.photos/seed/${id}/800/500`]);
  };

  const previewListing: Listing = {
    id: "preview",
    type: type || "offering",
    title: title || "Your listing title",
    description,
    district: district || "Vilnius",
    city: "Vilnius",
    price: parseInt(price) || 0,
    utilitiesIncluded,
    availableFrom: availableFrom || new Date().toISOString(),
    photos: photos.length > 0 ? photos : ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"],
    allowsSmoking: smoking,
    allowsPets: pets,
    genderPref,
    isBoosted: false,
    isVerified: true,
    poster: { ...mockCurrentUser },
    views: 0,
    createdAt: new Date().toISOString(),
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      toast({ title: "🎉 Your listing is live!" });
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <StepProgress steps={steps} currentStep={step} />

        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">What are you posting?</h2>
            <div className="grid grid-cols-2 gap-4">
              {([
                { value: "offering" as const, icon: <Home size={24} />, label: "I have a room", desc: "I'm offering a room in my flat" },
                { value: "seeking" as const, icon: <Search size={24} />, label: "I'm looking for a room", desc: "I need a flatmate" },
              ]).map(opt => (
                <button key={opt.value} onClick={() => setType(opt.value)}
                  className={`rounded-xl border-2 p-5 text-left transition-colors ${
                    type === opt.value ? "border-primary bg-primary-light" : "border-border hover:border-primary/30"
                  }`}>
                  <div className="mb-2 text-primary">{opt.icon}</div>
                  <div className="text-sm font-semibold text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                </button>
              ))}
            </div>
            <input type="text" placeholder="e.g. Bright room in Žirmūnai, bills included" value={title}
              onChange={e => setTitle(e.target.value.slice(0, 80))}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            <p className="text-right text-xs text-muted-foreground">{title.length}/80</p>
            <select value={district} onChange={e => setDistrict(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary">
              <option value="">Select district</option>
              {vilniusDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)}
                className="w-32 rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
              <span className="text-sm text-muted-foreground">€ / month</span>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={utilitiesIncluded} onChange={() => setUtilitiesIncluded(!utilitiesIncluded)}
                className="rounded border-border text-primary focus:ring-primary" />
              Utilities included in price
            </label>
            <button onClick={() => setStep(1)} disabled={!type || !title || !district || !price}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-50">
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">Details</h2>
            <div>
              <textarea placeholder="Describe the room, the flat, your lifestyle..." value={description}
                onChange={e => setDescription(e.target.value.slice(0, 800))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" rows={5} />
              <p className="text-right text-xs text-muted-foreground">{description.length}/800</p>
            </div>
            <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Gender preference</p>
              <div className="flex gap-2">
                {(["any", "male", "female"] as const).map(g => (
                  <button key={g} onClick={() => setGenderPref(g)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      genderPref === g ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
                    }`}>{g === "any" ? "Any" : g + " only"}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              {[
                { label: smoking ? "✓ Smoking ok" : "✗ No smoking", active: smoking, toggle: () => setSmoking(!smoking) },
                { label: pets ? "✓ Pets welcome" : "✗ No pets", active: pets, toggle: () => setPets(!pets) },
              ].map(item => (
                <button key={item.label} onClick={item.toggle}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    item.active ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
                  }`}>{item.label}</button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground">← Back</button>
              <button onClick={() => setStep(2)} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">Photos</h2>
            <button onClick={addMockPhoto}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-12 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Camera size={32} className="mb-2" />
              <p className="text-sm font-medium">Drop photos here or click to upload</p>
              <p className="text-xs">1 photo required, up to 6 total · JPG, PNG, WebP</p>
            </button>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p} alt="" className="aspect-video w-full rounded-lg object-cover" />
                    {i === 0 && <span className="absolute left-2 top-2 rounded bg-foreground/60 px-1.5 py-0.5 text-[10px] text-primary-foreground">Cover</span>}
                    <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/60 text-xs text-primary-foreground">×</button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{photos.length} / 6 photos</p>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground">← Back</button>
              <button onClick={() => setStep(3)} disabled={photos.length === 0}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">Your listing preview</h2>
            <div className="max-w-sm mx-auto">
              <ListingCard listing={previewListing} />
            </div>
            <p className="text-center text-sm text-muted-foreground">This is how your listing will appear to others.</p>
            <button onClick={handlePublish} disabled={publishing}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-50">
              {publishing ? "Publishing..." : "Publish listing"}
            </button>
            <button onClick={() => { toast({ title: "Draft saved." }); navigate("/dashboard"); }}
              className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground">
              Save as draft
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
