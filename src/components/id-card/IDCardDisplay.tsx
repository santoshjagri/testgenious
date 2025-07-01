
"use client";

import type * as React from 'react';
import Image from 'next/image';
import type { StoredIDCardData } from '@/lib/types';

interface IDCardDisplayProps {
  data: StoredIDCardData;
}

const ClassicCard: React.FC<IDCardDisplayProps> = ({ data }) => (
  <div className="id-card-base id-card-classic">
    <div className="header">
      {data.logoDataUri && (
        <Image src={data.logoDataUri} alt="Logo" width={48} height={48} className="logo" data-ai-hint="school emblem" unoptimized />
      )}
      <p className="inst-name">{data.institutionName}</p>
    </div>
    <div className="content">
      <Image src={data.photoDataUri} alt="Holder Photo" width={112} height={112} className="photo" data-ai-hint="student portrait" unoptimized />
      <p className="name">{data.fullName}</p>
      <p className="role">{data.classOrCourse}</p>
      <div className="details-grid">
        <strong>DOB:</strong><p>{data.dateOfBirth}</p>
        <strong>Issued:</strong><p>{data.issueDate}</p>
        <strong>Expires:</strong><p>{data.expiryDate}</p>
      </div>
      <p className="address">{data.holderAddress}</p>
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
          <tr><td><strong>DOB</strong></td><td>: {data.dateOfBirth}</td></tr>
          <tr><td><strong>Issued</strong></td><td>: {data.issueDate}</td></tr>
          <tr><td><strong>Expires</strong></td><td>: {data.expiryDate}</td></tr>
        </tbody>
      </table>
      <p className="address">{data.holderAddress}</p>
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
        <p className="text-xs mt-2"><strong>DOB:</strong> {data.dateOfBirth}</p>
        <p className="text-xs"><strong>Issued:</strong> {data.issueDate}</p>
        <p className="text-xs"><strong>Expires:</strong> {data.expiryDate}</p>
      </div>
    </div>
    <div className="footer">
      <p className="address">{data.holderAddress}</p>
    </div>
  </div>
);


const ElegantCard: React.FC<IDCardDisplayProps> = ({ data }) => (
  <div className="id-card-base id-card-elegant">
    <div className="header">
      {data.logoDataUri && (
        <Image src={data.logoDataUri} alt="Logo" width={40} height={40} className="logo" data-ai-hint="school emblem" unoptimized />
      )}
      <p className="inst-name">{data.institutionName}</p>
    </div>
    <div className="photo-container">
      <Image src={data.photoDataUri} alt="Holder Photo" width={128} height={128} className="photo" data-ai-hint="student portrait" unoptimized />
    </div>
    <p className="name">{data.fullName}</p>
    <p className="role">{data.classOrCourse}</p>
    <div className="details-grid">
        <p><strong>DOB:</strong></p><p>{data.dateOfBirth}</p>
        <p><strong>Issued:</strong></p><p>{data.issueDate}</p>
        <p><strong>Expires:</strong></p><p>{data.expiryDate}</p>
    </div>
    <div className="footer">
        <p>{data.holderAddress}</p>
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
    <div className={`id-card-wrapper ${data.template === 'Elegant' ? 'elegant-wrapper' : ''}`.trim()}>
      {renderCard()}
    </div>
  );
}
