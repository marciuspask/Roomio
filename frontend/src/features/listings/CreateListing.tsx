import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import Nav from "@/components/Nav";
import StepProgress from "@/components/StepProgress";
import ListingCard from "@/features/listings/ListingCard";
import { lithuanianCities } from "@/lib/mockData";
import { useCreateListing } from "@/api/hooks";
import { useToast } from "@/hooks/use-toast";
import { ListingType, GenderPref, ListingStatus } from "@/api/generated/data-contracts";
import type { Listing } from "@/api/generated/data-contracts";
import { Home, Search, Camera } from "lucide-react";

const CreateListing = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync, isPending } = useCreateListing();

  const [step, setStep] = useState(0);
  const steps = ["Type & basics", "Details", "Photos", "Preview & publish"];

  // Step 1
  const [listingType, setListingType] = useState<ListingType | null>(null);
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [price, setPrice] = useState("");
  const [utilitiesIncl, setUtilitiesIncl] = useState(false);

  // Step 2
  const [description, setDescription] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [genderPref, setGenderPref] = useState<GenderPref>(GenderPref.Any);
  const [smoking, setSmoking] = useState(false);
  const [pets, setPets] = useState(false);

  // Step 3 (photos — no API backing yet)
  const [photos, setPhotos] = useState<string[]>([]);

  if (!isSignedIn) {
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
    tenant_id: "",
    listing_type: listingType ?? ListingType.Offering,
    title: title || "Your listing title",
    description,
    district: district || null,
    city: city || "Vilnius",
    price: parseInt(price) || 0,
    utilities_incl: utilitiesIncl,
    available_from: availableFrom || new Date().toISOString().slice(0, 10),
    allows_smoking: smoking,
    allows_pets: pets,
    gender_pref: genderPref,
    status: ListingStatus.Active,
    is_boosted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const handlePublish = async () => {
    try {
      await mutateAsync({
        listing_type: listingType!,
        title,
        description,
        city,
        district: district || null,
        price: parseInt(price),
        utilities_incl: utilitiesIncl,
        available_from: availableFrom,
        allows_smoking: smoking,
        allows_pets: pets,
        gender_pref: genderPref,
        status: ListingStatus.Active,
      });
      toast({ title: "Your listing is live!" });
      navigate("/listings");
    } catch {
      toast({ title: "Failed to publish", description: "Please try again.", variant: "destructive" });
    }
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
                { value: ListingType.Offering, icon: <Home size={24} />, label: "I have a room", desc: "I'm offering a room in my flat" },
                { value: ListingType.Seeking, icon: <Search size={24} />, label: "I'm looking for a room", desc: "I need a flatmate" },
              ]).map(opt => (
                <button key={opt.value} onClick={() => setListingType(opt.value)}
                  className={`rounded-xl border-2 p-5 text-left transition-colors ${
                    listingType === opt.value ? "border-primary bg-primary-light" : "border-border hover:border-primary/30"
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
            <select value={city} onChange={e => setCity(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary">
              <option value="">Select city</option>
              {lithuanianCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" placeholder="Neighbourhood / district (optional)" value={district}
              onChange={e => setDistrict(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)}
                className="w-32 rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
              <span className="text-sm text-muted-foreground">€ / month</span>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={utilitiesIncl} onChange={() => setUtilitiesIncl(!utilitiesIncl)}
                className="rounded border-border text-primary focus:ring-primary" />
              Utilities included in price
            </label>
            <button onClick={() => setStep(1)} disabled={!listingType || !title || !city || !price}
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
                {([GenderPref.Any, GenderPref.Male, GenderPref.Female] as const).map(g => (
                  <button key={g} onClick={() => setGenderPref(g)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      genderPref === g ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
                    }`}>{g === GenderPref.Any ? "Any" : g + " only"}</button>
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
              <button onClick={() => setStep(2)} disabled={!description || !availableFrom}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">Photos</h2>
            <p className="text-sm text-muted-foreground">Photo uploads are coming soon. You can skip this step.</p>
            <button onClick={addMockPhoto}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-12 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Camera size={32} className="mb-2" />
              <p className="text-sm font-medium">Drop photos here or click to upload</p>
              <p className="text-xs">Up to 6 total · JPG, PNG, WebP</p>
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
              <button onClick={() => setStep(3)}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-foreground">Your listing preview</h2>
            <div className="mx-auto max-w-sm">
              <ListingCard listing={previewListing} />
            </div>
            <p className="text-center text-sm text-muted-foreground">This is how your listing will appear to others.</p>
            <button onClick={handlePublish} disabled={isPending}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-50">
              {isPending ? "Publishing..." : "Publish listing"}
            </button>
            <button onClick={() => setStep(2)}
              className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground">
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
