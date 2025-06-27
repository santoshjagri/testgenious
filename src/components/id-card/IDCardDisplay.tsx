
"use client";

import type * as React from 'react';
import Image from 'next/image';
import type { StoredIDCardData } from '@/lib/types';

interface IDCardDisplayProps {
  data: StoredIDCardData;
}

const SchoolCard: React.FC<IDCardDisplayProps> = ({ data }) => (
  <div className="id-card-base id-card-school">
    <div className="header">
      {data.logoDataUri ? (
        <Image src={data.logoDataUri} alt="Logo" width={32} height={32} className="w-8 h-8 mr-2" data-ai-hint="school emblem" unoptimized />
      ) : (
        <div className="w-8 h-8 mr-2 bg-white rounded-full"></div>
      )}
      <div className="text-left">
        <p className="header-title">{data.institutionName}</p>
        <p className="text-[9px] leading-tight">{data.institutionAddress}</p>
      </div>
    </div>
    <div className="flex-grow flex items-center gap-4">
      <Image src={data.photoDataUri} alt="Student Photo" width={96} height={96} className="photo" data-ai-hint="student portrait" unoptimized />
      <div className="flex-grow text-left">
        <p className="name">{data.fullName}</p>
        <p className="class">{data.classOrCourse}</p>
        <div className="details-grid">
          <p><strong>ID:</strong> {data.idNumber}</p>
          <p><strong>DOB:</strong> {data.dateOfBirth}</p>
          <p><strong>Blood:</strong> {data.bloodGroup || 'N/A'}</p>
          <p><strong>Expires:</strong> {data.expiryDate}</p>
        </div>
      </div>
    </div>
    <div className="text-xs text-center text-gray-500 mt-auto">{data.holderAddress}</div>
  </div>
);

const CollegeCard: React.FC<IDCardDisplayProps> = ({ data }) => (
  <div className="id-card-base id-card-college">
    <div className="header-strip"></div>
    <div className="content-area">
      <Image src={data.photoDataUri} alt="Student Photo" width={80} height={96} className="photo" data-ai-hint="student portrait" unoptimized />
      <div className="flex-grow">
        {data.logoDataUri && (
          <Image src={data.logoDataUri} alt="Logo" width={40} height={40} className="w-10 h-10 mb-1" data-ai-hint="college emblem" unoptimized />
        )}
        <p className="course">{data.classOrCourse}</p>
        <p className="name">{data.fullName}</p>
        <p className="text-sm font-medium text-gray-700">ID: {data.idNumber}</p>
      </div>
    </div>
    <table className="details-table">
      <tbody>
        <tr><td>DOB</td><td>: {data.dateOfBirth}</td></tr>
        <tr><td>Contact</td><td>: {data.contactNumber || 'N/A'}</td></tr>
        <tr><td>Issued</td><td>: {data.issueDate}</td></tr>
        <tr><td>Expires</td><td>: {data.expiryDate}</td></tr>
      </tbody>
    </table>
    {data.authoritySignatureDataUri ? (
      <Image src={data.authoritySignatureDataUri} alt="Signature" width={80} height={20} className="w-20 h-5 mt-auto ml-auto" data-ai-hint="signature" unoptimized />
    ) : (
      <div className="h-5"></div>
    )}
    <p className="text-[9px] text-right -mt-1">{data.authorityName || 'Issuing Authority'}</p>
  </div>
);

const UniversityCard: React.FC<IDCardDisplayProps> = ({ data }) => (
  <div className="id-card-base id-card-university">
    <div className="header">
      {data.logoDataUri ? (
        <Image src={data.logoDataUri} alt="Logo" width={48} height={48} className="logo" data-ai-hint="university crest" unoptimized />
      ) : (
         <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      )}
      <div className="header-title">
        <p className="inst-name">{data.institutionName}</p>
        <p className="inst-motto">{data.institutionAddress}</p>
      </div>
      <div className="w-12"></div>
    </div>
    <div className="main-content">
      <Image src={data.photoDataUri} alt="Student Photo" width={80} height={96} className="photo" data-ai-hint="student portrait" unoptimized />
      <div>
        <p className="name">{data.fullName}</p>
        <p className="text-sm text-gray-600">{data.classOrCourse}</p>
        <div className="details-list">
          <p><strong>ID:</strong> {data.idNumber}</p>
          <p><strong>DOB:</strong> {data.dateOfBirth}</p>
          <p><strong>Issued:</strong> {data.issueDate} &nbsp; <strong>Expires:</strong> {data.expiryDate}</p>
        </div>
      </div>
    </div>
    <div className="mt-auto">
        {data.authoritySignatureDataUri && (
            <Image src={data.authoritySignatureDataUri} alt="Signature" width={60} height={15} className="float-right" data-ai-hint="signature" unoptimized />
        )}
        <Image src="https://placehold.co/150x30.png" data-ai-hint="barcode" alt="Barcode" width={150} height={30} className="barcode" unoptimized />
    </div>
  </div>
);


export function IDCardDisplay({ data }: IDCardDisplayProps) {
  const renderCard = () => {
    switch (data.level) {
      case 'School':
        return <SchoolCard data={data} />;
      case 'College':
        return <CollegeCard data={data} />;
      case 'University':
        return <UniversityCard data={data} />;
      default:
        return <SchoolCard data={data} />;
    }
  };

  return (
    <div className="id-card-wrapper flex justify-center">
      {renderCard()}
    </div>
  );
}

    