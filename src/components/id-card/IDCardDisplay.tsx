
"use client";

import type * as React from 'react';
import Image from 'next/image';
import type { StoredIDCardData } from '@/lib/types';

interface IDCardDisplayProps {
  data: StoredIDCardData;
}

const ClassicCard: React.FC<IDCardDisplayProps> = ({ data }) => (
  <div className="id-card-base id-card-classic">
    <div className="header-bar"></div>
    <div className="content">
      {data.logoDataUri && (
        <Image src={data.logoDataUri} alt="Logo" width={40} height={40} className="logo" data-ai-hint="school emblem" unoptimized />
      )}
      <Image src={data.photoDataUri} alt="Holder Photo" width={96} height={96} className="photo" data-ai-hint="student portrait" unoptimized />
      <p className="inst-name">{data.institutionName}</p>
      <p className="name">{data.fullName}</p>
      <p className="role">{data.classOrCourse}</p>
      <div className="details-grid">
        <p><strong>DOB:</strong> {data.dateOfBirth}</p>
        <p><strong>Expires:</strong> {data.expiryDate}</p>
      </div>
       <div className="footer-info">
        {data.holderAddress}
      </div>
    </div>
  </div>
);

const ModernCard: React.FC<IDCardDisplayProps> = ({ data }) => (
  <div className="id-card-base id-card-modern">
    <div className="accent-strip">
       <Image src={data.photoDataUri} alt="Holder Photo" width={96} height={96} className="photo" data-ai-hint="student portrait" unoptimized />
       {data.logoDataUri && (
         <Image src={data.logoDataUri} alt="Logo" width={48} height={48} className="logo" data-ai-hint="college emblem" unoptimized />
       )}
    </div>
    <div className="main-content">
      <p className="inst-name">{data.institutionName}</p>
      <p className="name">{data.fullName}</p>
      <p className="role">{data.classOrCourse}</p>
      <table className="details-table">
        <tbody>
          <tr><td>DOB</td><td>: {data.dateOfBirth}</td></tr>
          <tr><td>Issued</td><td>: {data.issueDate}</td></tr>
          <tr><td>Expires</td><td>: {data.expiryDate}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
);


const VibrantCard: React.FC<IDCardDisplayProps> = ({ data }) => (
  <div className="id-card-base id-card-vibrant">
    <div className="header">
      {data.logoDataUri && (
        <Image src={data.logoDataUri} alt="Logo" width={40} height={40} className="logo" data-ai-hint="university crest" unoptimized />
      )}
      <div className="inst-name">
        <p>{data.institutionName}</p>
      </div>
    </div>
    <div className="main-content">
      <Image src={data.photoDataUri} alt="Holder Photo" width={112} height={112} className="photo" data-ai-hint="student portrait" unoptimized />
      <div className="details">
        <p className="name">{data.fullName}</p>
        <p className="role">{data.classOrCourse}</p>
        <p className="text-xs mt-2"><strong>Valid Thru:</strong> {data.expiryDate}</p>
      </div>
    </div>
     <div className="footer">
        <div>{data.authorityName}</div>
        {data.authoritySignatureDataUri && (
           <Image src={data.authoritySignatureDataUri} alt="Signature" width={80} height={20} className="signature" data-ai-hint="signature" unoptimized />
        )}
     </div>
  </div>
);


const ElegantCard: React.FC<IDCardDisplayProps> = ({ data }) => (
  <div className="id-card-base id-card-elegant">
    <div className="header">
      {data.logoDataUri && (
        <Image src={data.logoDataUri} alt="Logo" width={48} height={48} className="logo" data-ai-hint="school emblem" unoptimized />
      )}
      <p className="inst-name">{data.institutionName}</p>
    </div>
    <div className="photo-container">
      <Image src={data.photoDataUri} alt="Holder Photo" width={128} height={160} className="photo" data-ai-hint="student portrait" unoptimized />
    </div>
    <div className="main-content">
        <p className="name">{data.fullName}</p>
        <p className="role">{data.classOrCourse}</p>
        <div className="details-list">
            <p><strong>Valid Thru:</strong> {data.expiryDate}</p>
        </div>
    </div>
    <div className="footer">
        {data.authoritySignatureDataUri ? (
            <Image src={data.authoritySignatureDataUri} alt="Signature" width={80} height={20} className="signature" data-ai-hint="signature" unoptimized />
        ) : <div className="h-8"></div>}
        <p className="authority-name">{data.authorityName || 'Issuing Authority'}</p>
    </div>
  </div>
);

export function IDCardDisplay({ data }: IDCardDisplayProps) {
  const renderCard = () => {
    switch (data.template) {
      case 'Classic':
        return <ClassicCard data={data} />;
      case 'Modern':
        return <ModernCard data={data} />;
      case 'Vibrant':
        return <VibrantCard data={data} />;
      case 'Elegant':
        return <ElegantCard data={data} />;
      default:
        return <ClassicCard data={data} />;
    }
  };

  return (
    <div className="id-card-wrapper">
      {renderCard()}
    </div>
  );
}
