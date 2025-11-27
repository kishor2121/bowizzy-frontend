import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, RotateCcw, X, Save } from "lucide-react";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { deleteFromCloudinary } from "@/utils/deleteFromCloudinary";
import { updatePersonalDetails } from "@/services/personalService";

interface PersonalDetailsFormProps {
  onNext: (data: any) => void;
  onBack?: () => void;
  initialData?: any;
  userId: string;
  token: string;
  personalDetailsId: string | null;
}

export default function PersonalDetailsForm({
  onNext,
  onBack,
  initialData = {},
  userId,
  token,
  personalDetailsId,
}: PersonalDetailsFormProps) {
  // Handler for initializing form data state
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    middleName: initialData.middleName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    mobileNumber: initialData.mobileNumber || "",
    dateOfBirth: initialData.dateOfBirth || "",
    gender: initialData.gender || "Male",
    languages: initialData.languages || [],
    address: initialData.address || "",
    country: initialData.country || "",
    state: initialData.state || "",
    city: initialData.city || "",
    pincode: initialData.pincode || "",
    nationality: initialData.nationality || "",
    passportNumber: initialData.passportNumber || "",
    uploadedPhotoURL: initialData.uploadedPhotoURL || "",
    uploadedPublicId: initialData.uploadedPublicId || "",
    profilePhoto: initialData.profilePhoto || null,
    profilePhotoPreview: initialData.profilePhotoPreview || "",
    uploadedDeleteToken: initialData.uploadedDeleteToken || "",
  });

  // Handler for initializing local states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newLanguage, setNewLanguage] = useState("");
  const [personalDetailsExpanded, setPersonalDetailsExpanded] = useState(true);
  const [languagesExpanded, setLanguagesExpanded] = useState(true);
  const [currentLocationExpanded, setCurrentLocationExpanded] = useState(true);

  // Track changes for each card
  const [languagesChanged, setLanguagesChanged] = useState(false);
  const [locationChanged, setLocationChanged] = useState(false);

  // Feedback messages
  const [languagesFeedback, setLanguagesFeedback] = useState("");
  const [locationFeedback, setLocationFeedback] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store initial values to compare changes
  const initialLanguages = useRef(initialData.languages || []);
  const initialLocation = useRef({
    address: initialData.address || "",
    country: initialData.country || "",
    state: initialData.state || "",
    city: initialData.city || "",
    pincode: initialData.pincode || "",
    nationality: initialData.nationality || "",
    passportNumber: initialData.passportNumber || "",
  });

  // Track which specific fields changed
  const [changedLanguages, setChangedLanguages] = useState(false);
  const [changedLocationFields, setChangedLocationFields] = useState<string[]>(
    []
  );

  // Handler for checking if languages changed
  useEffect(() => {
    const hasChanged =
      JSON.stringify(formData.languages) !==
      JSON.stringify(initialLanguages.current);
    setLanguagesChanged(hasChanged);
    setChangedLanguages(hasChanged);
  }, [formData.languages]);

  // Handler for checking which location fields changed
  useEffect(() => {
    const changedFields: string[] = [];

    if (formData.address !== initialLocation.current.address)
      changedFields.push("address");
    if (formData.country !== initialLocation.current.country)
      changedFields.push("country");
    if (formData.state !== initialLocation.current.state)
      changedFields.push("state");
    if (formData.city !== initialLocation.current.city)
      changedFields.push("city");
    if (formData.pincode !== initialLocation.current.pincode)
      changedFields.push("pincode");
    if (formData.nationality !== initialLocation.current.nationality)
      changedFields.push("nationality");
    if (formData.passportNumber !== initialLocation.current.passportNumber)
      changedFields.push("passportNumber");

    setChangedLocationFields(changedFields);
    setLocationChanged(changedFields.length > 0);
  }, [
    formData.address,
    formData.country,
    formData.state,
    formData.city,
    formData.pincode,
    formData.nationality,
    formData.passportNumber,
  ]);

  // Validation functions
  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (value && !/^[a-zA-Z\s]+$/.test(value)) {
          error = "Only letters allowed";
        }
        break;

      case "middleName":
        if (value && !/^[a-zA-Z\s]+$/.test(value)) {
          error = "Only letters allowed";
        }
        break;

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Invalid email format";
        }
        break;

      case "mobileNumber":
        if (value && !/^\d{0,10}$/.test(value)) {
          error = "Only 10 digits allowed";
        } else if (value && value.length > 0 && value.length < 10) {
          error = "Must be 10 digits";
        }
        break;

      case "pincode":
        if (value && !/^\d{0,6}$/.test(value)) {
          error = "Only 6 digits allowed";
        } else if (value && value.length > 0 && value.length < 6) {
          error = "Must be 6 digits";
        }
        break;

      case "passportNumber":
        if (value && !/^[A-Z0-9]*$/.test(value)) {
          error = "Only uppercase letters and numbers";
        }
        break;
    }

    return error;
  };

  // Handler for input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "mobileNumber" && value.length > 10) return;
    if (name === "pincode" && value.length > 6) return;
    if (name === "passportNumber") {
      const upperValue = value.toUpperCase();
      setFormData((prev) => ({ ...prev, [name]: upperValue }));
      const error = validateField(name, upperValue);
      setErrors((prev) => ({ ...prev, [name]: error }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handler for photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    const prev = formData.profilePhotoPreview;
    if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(prev);
      } catch {
        /* ignore */
      }
    }

    try {
      const cloudinaryRes = await uploadToCloudinary(file);

      // Immediately save to backend - Send only profile photo URL
      if (personalDetailsId) {
        const payload = {
          profile_photo_url: cloudinaryRes.url,
        };
        console.log("Updating profile photo with payload:", payload);
        await updatePersonalDetails(userId, token, personalDetailsId, payload);
      }

      setFormData((prev) => ({
        ...prev,
        profilePhoto: file,
        profilePhotoPreview: previewURL,
        uploadedPhotoURL: cloudinaryRes.url,
        uploadedPublicId: cloudinaryRes.publicId,
        uploadedDeleteToken: cloudinaryRes.deleteToken || "",
      }));

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  // Handler for photo click
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  // Handler for adding a language
  const handleAddLanguage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newLanguage.trim()) {
      e.preventDefault();
      if (!formData.languages.includes(newLanguage.trim())) {
        setFormData((prev) => ({
          ...prev,
          languages: [...prev.languages, newLanguage.trim()],
        }));
      }
      setNewLanguage("");
    }
  };

  // Handler for removing a language
  const handleRemoveLanguage = (languageToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter(
        (lang: string) => lang !== languageToRemove
      ),
    }));
  };

  // Handler for clearing all languages
  const handleClearLanguages = () => {
    setFormData((prev) => ({
      ...prev,
      languages: [],
    }));
    setLanguagesChanged(true);
  };

  // Handler for clearing current location fields
  const handleClearCurrentLocation = () => {
    setFormData((prev) => ({
      ...prev,
      address: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
      nationality: "",
      passportNumber: "",
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.pincode;
      delete newErrors.passportNumber;
      return newErrors;
    });
  };

  // Handler for updating Languages (PUT call)
  const handleUpdateLanguages = async () => {
    if (!personalDetailsId) {
      console.error("No personalDetailsId available");
      setLanguagesFeedback("Unable to save: Missing personal details ID");
      setTimeout(() => setLanguagesFeedback(""), 3000);
      return;
    }

    try {
      // Create payload with only the changed field
      const payload = {
        languages_known: formData.languages,
      };

      console.log("Updating languages with payload:", payload);

      await updatePersonalDetails(userId, token, personalDetailsId, payload);
      initialLanguages.current = [...formData.languages];
      setLanguagesChanged(false);
      setChangedLanguages(false);
      setLanguagesFeedback("Languages updated successfully!");
      setTimeout(() => setLanguagesFeedback(""), 3000);
    } catch (error) {
      console.error("Error updating languages:", error);
      setLanguagesFeedback("Failed to update languages");
      setTimeout(() => setLanguagesFeedback(""), 3000);
    }
  };

  // Handler for updating Location (PUT call)
  const handleUpdateLocation = async () => {
    if (!personalDetailsId || changedLocationFields.length === 0) {
      console.error("No personalDetailsId available or no fields changed");
      if (!personalDetailsId) {
        setLocationFeedback("Unable to save: Missing personal details ID");
        setTimeout(() => setLocationFeedback(""), 3000);
      }
      return;
    }

    try {
      // Create payload with only the changed fields
      const payload: any = {};

      changedLocationFields.forEach((field) => {
        switch (field) {
          case "address":
            payload.address = formData.address;
            break;
          case "country":
            payload.country = formData.country;
            break;
          case "state":
            payload.state = formData.state;
            break;
          case "city":
            payload.city = formData.city;
            break;
          case "pincode":
            payload.pincode = formData.pincode;
            break;
          case "nationality":
            payload.nationality = formData.nationality;
            break;
          case "passportNumber":
            payload.passport_number = formData.passportNumber;
            break;
        }
      });

      // console.log("Updating location with payload:", payload);

      await updatePersonalDetails(userId, token, personalDetailsId, payload);

      // Update initial values
      initialLocation.current = {
        address: formData.address,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        nationality: formData.nationality,
        passportNumber: formData.passportNumber,
      };

      setLocationChanged(false);
      setChangedLocationFields([]);
      setLocationFeedback("Location updated successfully!");
      setTimeout(() => setLocationFeedback(""), 3000);
    } catch (error) {
      console.error("Error updating location:", error);
      setLocationFeedback("Failed to update location");
      setTimeout(() => setLocationFeedback(""), 3000);
    }
  };

  // Determine if the form can proceed (no unsaved changes + no validation errors)
  const canProceed = !(
    (
      languagesChanged ||
      locationChanged ||
      Object.keys(errors).some((key) => errors[key])
    ) // Check if any error message exists
  );

  // Handler for form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if there are unsaved changes
    if (languagesChanged || locationChanged) {
      setLanguagesFeedback(
        languagesChanged ? "Please save your changes before proceeding" : ""
      );
      setLocationFeedback(
        locationChanged ? "Please save your changes before proceeding" : ""
      );
      return;
    }

    // Check if there are validation errors
    if (Object.keys(errors).some((key) => errors[key])) {
      // Find first error field and show a generic alert
      alert("Please fix validation errors before proceeding.");
      return;
    }

    onNext(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Step Header */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-1">
            Step 1: Personal Details
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Add your personal information and contact details
          </p>
        </div>

        {/* Personal Details Section */}
        <div className="bg-white border border-gray-200 rounded-xl mb-4 md:mb-5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
              Personal Details
            </h3>
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() =>
                  setPersonalDetailsExpanded(!personalDetailsExpanded)
                }
                className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ChevronDown
                  className={`w-3 h-3 text-gray-600 cursor-pointer transition-transform ${
                    !personalDetailsExpanded ? "rotate-180" : ""
                  }`}
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>

          {/* Content */}
          {personalDetailsExpanded && (
            <div className="p-4 sm:p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
                {/* Profile Photo */}
                <div className="md:col-span-3 flex justify-center md:justify-start">
                  <div className="flex flex-col items-center">
                    <div
                      onClick={handlePhotoClick}
                      className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-orange-400 transition-colors group"
                    >
                      {formData.profilePhoto ? (
                        <>
                          <img
                            src={
                              formData.profilePhotoPreview ||
                              (typeof formData.profilePhoto === "string"
                                ? `/uploads/${formData.profilePhoto}`
                                : "")
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();

                              if (formData.uploadedDeleteToken) {
                                await deleteFromCloudinary(
                                  formData.uploadedDeleteToken
                                );
                              }

                              try {
                                const prev = formData.profilePhotoPreview;
                                if (
                                  prev &&
                                  typeof prev === "string" &&
                                  prev.startsWith("blob:")
                                ) {
                                  URL.revokeObjectURL(prev);
                                }
                              } catch (e) {
                                console.warn("Failed to revoke object URL", e);
                              }

                              setFormData((prev) => ({
                                ...prev,
                                profilePhoto: null,
                                profilePhotoPreview: "",
                                uploadedPhotoURL: "",
                                uploadedPublicId: "",
                                uploadedDeleteToken: "",
                              }));

                              if (fileInputRef.current)
                                fileInputRef.current.value = "";
                            }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 z-10"
                          >
                            <X className="w-3.5 h-3.5 text-red-500 cursor-pointer" />
                          </button>
                        </>
                      ) : (
                        <svg
                          className="w-12 h-12 sm:w-14 sm:h-14 text-gray-400 group-hover:text-orange-400 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handlePhotoClick}
                      className="mt-2 text-xs sm:text-sm text-gray-700 hover:text-orange-400 font-medium transition-colors"
                    >
                      Upload Profile Photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Form Fields - Frozen (Read-only with gray background) */}
                <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* First Name - Frozen */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      disabled
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-xs sm:text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Middle Name - Frozen */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      disabled
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-xs sm:text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Last Name - Frozen */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      disabled
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-xs sm:text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Email - Frozen */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-xs sm:text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Mobile Number - Frozen */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value="+91"
                        disabled
                        className="w-12 sm:w-14 px-2 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-xs sm:text-sm text-center cursor-not-allowed"
                      />
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        disabled
                        className="flex-1 px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-xs sm:text-sm tracking-wider cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Date of Birth - Frozen */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      disabled
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-xs sm:text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Gender - Frozen */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={formData.gender}
                        disabled
                        className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-xs sm:text-sm appearance-none cursor-not-allowed"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Languages Known Section - NEW SEPARATE CARD */}
        <div className="bg-white border border-gray-200 rounded-xl mb-4 md:mb-5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
              Languages Known
            </h3>
            <div className="flex gap-2 items-center">
              {languagesChanged && (
                <button
                  type="button"
                  onClick={handleUpdateLanguages}
                  className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
                  title="Save changes"
                >
                  <Save
                    className="w-3 h-3 text-green-600 cursor-pointer"
                    strokeWidth={2.5}
                  />
                </button>
              )}
              <button
                type="button"
                onClick={() => setLanguagesExpanded(!languagesExpanded)}
                className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ChevronDown
                  className={`w-3 h-3 text-gray-600 cursor-pointer transition-transform ${
                    !languagesExpanded ? "rotate-180" : ""
                  }`}
                  strokeWidth={2.5}
                />
              </button>
              <button
                type="button"
                onClick={handleClearLanguages}
                className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
              >
                <RotateCcw
                  className="w-3 h-3 text-gray-600 cursor-pointer"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>

          {/* Content */}
          {languagesExpanded && (
            <div className="p-4 sm:p-5 md:p-6">
              {languagesFeedback && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    languagesFeedback.includes("success")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {languagesFeedback}
                </div>
              )}
              <div className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-transparent min-h-[38px] sm:min-h-[42px]">
                <div className="flex flex-wrap gap-2 items-center">
                  {formData.languages.map((lang: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-md text-xs sm:text-sm"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(lang)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 cursor-pointer" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyDown={handleAddLanguage}
                    placeholder="Add Language known to you..."
                    className="flex-1 min-w-[150px] sm:min-w-[200px] outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Location Section */}
        <div className="bg-white border border-gray-200 rounded-xl mb-4 md:mb-5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
              Current Location
            </h3>
            <div className="flex gap-2 items-center">
              {locationChanged && (
                <button
                  type="button"
                  onClick={handleUpdateLocation}
                  className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors"
                  title="Save changes"
                >
                  <Save
                    className="w-3 h-3 text-green-600 cursor-pointer"
                    strokeWidth={2.5}
                  />
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  setCurrentLocationExpanded(!currentLocationExpanded)
                }
                className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ChevronDown
                  className={`w-3 h-3 text-gray-600 cursor-pointer transition-transform ${
                    !currentLocationExpanded ? "rotate-180" : ""
                  }`}
                  strokeWidth={2.5}
                />
              </button>
              <button
                type="button"
                onClick={handleClearCurrentLocation}
                className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-600 hover:bg-gray-100 transition-colors"
              >
                <RotateCcw
                  className="w-3 h-3 text-gray-600 cursor-pointer"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>

          {/* Content */}
          {currentLocationExpanded && (
            <div className="p-4 sm:p-5 md:p-6">
              {locationFeedback && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    locationFeedback.includes("success")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {locationFeedback}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Address */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    rows={3}
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm resize-none"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                    >
                      <option value="">Select Country</option>
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    State
                  </label>
                  <div className="relative">
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                    >
                      <option value="">Select State</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    City
                  </label>
                  <div className="relative">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                    >
                      <option value="">Select City</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter Pin code"
                    maxLength={6}
                    className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                      errors.pincode
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                    }`}
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.pincode}
                    </p>
                  )}
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Nationality
                  </label>
                  <div className="relative">
                    <select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-xs sm:text-sm appearance-none bg-white pr-8"
                    >
                      <option value="">Select Nationality</option>
                      <option value="Indian">Indian</option>
                      <option value="American">American</option>
                      <option value="British">British</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Passport Number */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                    placeholder="Enter Passport Number"
                    className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                      errors.passportNumber
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-orange-400 focus:border-transparent"
                    }`}
                  />
                  {errors.passportNumber && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.passportNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canProceed} // Use the consolidated disabled state
            style={{
              background: canProceed
                ? "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)"
                : "#BDBDBD",
            }}
            className="px-6 sm:px-8 py-2.5 sm:py-3 text-white rounded-xl font-medium text-xs sm:text-sm transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            Proceed to next
          </button>
        </div>
      </div>
    </form>
  );
}
