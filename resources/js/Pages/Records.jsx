import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Records({ NID_PUBLIC_API_KEY }) {
    const [searchValues, setSearchValues] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        suffix: '',
        birth_date: '',
        no_middle_name: false,
    });
    const [searchResult, setSearchResult] = useState({});
    const [natIDResult, setNatIDResult] = useState({});
    const [isSearching, setIsSearching] = useState(false);
    const [isDoneSearching, setIsDoneSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [openRBIDataModal, setOpenRBIDataModal] = useState(false);
    const [openNatIDDataModal, setOpenNatIDDataModal] = useState(false);

    useEffect(() => {
        // console.log("NID_PUBLIC_API_KEY: ", NID_PUBLIC_API_KEY)
    }, []);

    function handleChange(e) {
        const key = e.target.id;
        const value = e.target.value;
        if (e.target.id == 'no_middle_name') {
            setSearchValues((searchValues) => ({
                ...searchValues,
                [key]: e.target.checked,
            }));
        } else {
            setSearchValues((searchValues) => ({
                ...searchValues,
                [key]: value,
            }));
        }

        setSearchResult({});
        setNatIDResult({});
    }

    function handleClear(e) {
        // console.log("Clear")
        setSearchValues({
            first_name: '',
            last_name: '',
            middle_name: '',
            suffix: '',
            birth_date: '',
            no_middle_name: '',
        });
        setSearchResult({});
        setNatIDResult({});
        setIsSearching(true);
        setIsDoneSearching(false);
        setIsLoading(false);
        setIsVerified(false);
        setIsVerifying(false);
        setVerificationStatus(true);
        setOpenModal(false);
    }

    function handleVerify(e) {
        console.log('Verify');
        setIsVerified(false);
        setIsVerifying(true);
        setIsLoading(true);
        setNatIDResult({});
        startLiveness();
    }

    function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
        setIsSearching(true);
        setIsDoneSearching(false);
        axios
            .post('/records', searchValues)
            .then(function (response) {
                // console.log("Response3: ", response);
                if (response.data != '') {
                    setSearchResult(response.data);
                    setIsLoading(false);
                    setIsSearching(false);
                    setIsDoneSearching(true);
                } else {
                    setSearchResult({});
                    setIsLoading(false);
                    setIsSearching(false);
                    setIsDoneSearching(true);
                }
            })
            .catch(function (error) {
                // console.log(error);
                setIsSearching(false);
                setIsSearching(true);
            });
    }

    function startLiveness() {
        window
            .eKYC()
            .start({
                pubKey: NID_PUBLIC_API_KEY,
            })
            .then((data) => {
                apiAuthenticate(data.result.session_id);
            })
            .catch((err) => {
                console.log('error', err);
                setIsLoading(false);
                setIsVerifying(false);
            });
    }

    function apiAuthenticate(liveness_session_id) {
        axios
            .post('/records/api/validate', {
                first_name: searchResult.first_name,
                last_name: searchResult.last_name,
                middle_name: searchValues.no_middle_name
                    ? null
                    : searchResult.middle_name,
                suffix: searchResult.extension,
                birth_date: searchResult.date_of_birth,
                face_liveness_session_id: liveness_session_id,
            })
            .then(function (response) {
                setNatIDResult(response);
                setIsLoading(false);

                if (response.data) {
                    // console.log("response.data: ", response.data)
                    if (response.data.reference) {
                        // console.log("response.data.reference: ", response.data.reference)
                        setOpenModal(true);
                        setIsVerifying(false);
                        setIsVerified(true);
                        setNatIDResult(response.data);
                    } else if (response.data.verified == false) {
                        setOpenModal(true);
                        setIsVerifying(false);
                        setIsVerified(false);
                        setVerificationStatus(false);
                        setNatIDResult({});
                    }
                }
            })
            .catch((err) => {
                // console.log('error: ', err);
                setIsLoading(false);
                setIsVerified(false);
                setVerificationStatus(false);
            });
    }

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleOpenRBIDataModal = () => {
        setOpenRBIDataModal(true);
    };
    const handleCloseRBIDataModal = () => {
        setOpenRBIDataModal(false);
    };

    const handleOpenNatIDDataModal = () => {
        setOpenNatIDDataModal(true);
    };
    const handleCloseNatIDDataModal = () => {
        setOpenNatIDDataModal(false);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Records
                </h2>
            }
        >
            <Head title="Records" />

            <Modal show={openModal} onClose={handleCloseModal}>
                <div className="relative rounded-lg bg-white shadow">
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        className="absolute end-2.5 top-3 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
                        data-modal-hide="popup-modal"
                    >
                        <svg
                            className="h-3 w-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 text-center md:p-5">
                        {(() => {
                            if (isVerified) {
                                return (
                                    <>
                                        <svg
                                            className="mx-auto mb-5 h-24 w-24 text-green-500"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            {' '}
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />{' '}
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        <h3 className="text-lg font-normal text-gray-500">
                                            Verified!
                                        </h3>
                                    </>
                                );
                            }
                            if (verificationStatus == false) {
                                return (
                                    <>
                                        <svg
                                            className="mx-auto mb-5 h-24 w-24 text-red-500"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            {' '}
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                            />{' '}
                                            <line
                                                x1="12"
                                                y1="8"
                                                x2="12"
                                                y2="12"
                                            />{' '}
                                            <line
                                                x1="12"
                                                y1="16"
                                                x2="12.01"
                                                y2="16"
                                            />
                                        </svg>
                                        <h3 className="text-lg font-normal text-gray-500">
                                            Verification Failed!
                                        </h3>
                                    </>
                                );
                            }
                        })()}
                    </div>
                </div>
            </Modal>

            <Modal show={openRBIDataModal} onClose={handleCloseRBIDataModal}>
                <div className="relative rounded-lg bg-white shadow">
                    {/* Modal header  */}
                    <div className="flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            RBI
                        </h3>
                        <button
                            type="button"
                            onClick={handleCloseRBIDataModal}
                            className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                            data-modal-hide="default-modal"
                        >
                            <svg
                                className="h-3 w-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div className="p-4 text-center md:p-5">
                        <div className="relative h-[50vh] overflow-x-auto shadow-md sm:rounded-lg">
                            <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
                                <tbody>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Sitio
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.sitio}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Barangay
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.barangay}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            House Number
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.house_number}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Household Number
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.household_number}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Last Name
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.last_name}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            First Name
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.first_name}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Middle Name
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.middle_name}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Ext Name
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.extension}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Citizenship
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.citizenship}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Nationality
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.nationality}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Relationship to HH Head
                                        </th>
                                        <td className="px-3 py-2">
                                            {
                                                searchResult.relationship_to_hh_head
                                            }
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Gender
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.gender}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Civil Status
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.civil_status}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Place of Birth
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.place_of_birth}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            POB Province
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.pob_province}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Date of Birth
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.date_of_birth}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Registered Voter
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.registered_voter}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Birth Registration
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.birth_registration}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Marriage Registration
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.marriage_registration}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Religion
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.religion}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Ethnic Group
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.ethnic_group}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Occupation
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.occupation}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Educational Attainment
                                        </th>
                                        <td className="px-3 py-2">
                                            {
                                                searchResult.educational_attainment
                                            }
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Skills
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.skills}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Persons w/ Disabilities
                                        </th>
                                        <td className="px-3 py-2">
                                            {
                                                searchResult.persons_with_disabilities
                                            }
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Variation
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.variation}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Date of Death
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.date_of_death}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Place of Death
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.place_of_death}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Cause of Death
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.cause_of_death}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Reason of Out-Migration
                                        </th>
                                        <td className="px-3 py-2">
                                            {
                                                searchResult.reason_of_outmigration
                                            }
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Electricity
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.electricity}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Pension
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.pension}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Sanitation
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.sanitation}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            DRRM Skills
                                        </th>
                                        <td className="px-3 py-2">
                                            {searchResult.drrm_skills}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            House Construction Materials
                                        </th>
                                        <td className="px-3 py-2">
                                            {
                                                searchResult.house_construction_materials
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal
                show={openNatIDDataModal}
                onClose={handleCloseNatIDDataModal}
            >
                <div className="relative rounded-lg bg-white shadow">
                    {/* Modal header  */}
                    <div className="flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            National ID
                        </h3>
                        <button
                            type="button"
                            onClick={handleCloseNatIDDataModal}
                            className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                            data-modal-hide="default-modal"
                        >
                            <svg
                                className="h-3 w-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div className="p-4 text-center md:p-5">
                        <div className="relative h-[50vh] overflow-x-auto shadow-md sm:rounded-lg">
                            <div className="mb-3">
                                <img
                                    className="m-auto h-auto max-w-xs"
                                    src={natIDResult.face_url}
                                />
                            </div>
                            <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
                                <tbody>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Address Line 1
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.address_line_1}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Address Line 2
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.address_line_2}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Barangay
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.barangay}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Birth Date
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.birth_date}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Blood Type
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.blood_type}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Country
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.country}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Email
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.email}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            First Name
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.first_name}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Full Address
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.full_address}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Full Name
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.full_name}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Gender
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.gender}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Last Name
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.last_name}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Marital Status
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.marital_status}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Middle Name
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.middle_name}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Mobile Number
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.mobile_number}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Municipality
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.municipality}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Place of Birth
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.place_of_birth}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            POB Country
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.pob_country}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            POB Municipality
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.pob_municipality}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            POB Province
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.pob_province}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Postal Code
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.postal_code}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Present Address Line 1
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.present_address_line_1}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Present Address Line 2
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.present_address_line_2}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Present Barangay
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.present_barangay}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Present Country
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.present_country}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Present Full Address
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.present_full_address}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Present Municipality
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.present_municipality}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Present Postal Code
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.present_postal_code}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Present Province
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.present_province}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Province
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.province}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Residency Status
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.residency_status}
                                        </td>
                                    </tr>
                                    <tr className="border-b odd:bg-white even:bg-gray-50 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                        <th
                                            scope="row"
                                            className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white"
                                        >
                                            Suffix
                                        </th>
                                        <td className="px-3 py-2">
                                            {natIDResult.suffix}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Modal>

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="relative block overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {(() => {
                            if (isLoading) {
                                return (
                                    <div>
                                        <div
                                            role="status"
                                            className="absolute left-1/2 top-2/4 z-20 -translate-x-1/2 -translate-y-1/2"
                                        >
                                            <div className="flex items-center justify-center">
                                                <svg
                                                    aria-hidden="true"
                                                    className="h-8 w-8 animate-spin fill-blue-600 text-gray-200"
                                                    viewBox="0 0 100 101"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                        fill="currentColor"
                                                    />
                                                    <path
                                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                        fill="currentFill"
                                                    />
                                                </svg>
                                                <div className="ml-3 text-center">
                                                    {isVerifying
                                                        ? 'Verifying...'
                                                        : 'Loading...'}{' '}
                                                    Plase Wait...
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute z-10 h-full w-full bg-slate-200/75"></div>
                                    </div>
                                );
                            } else {
                            }
                        })()}
                        <div className="p-6 text-gray-900">
                            {(() => {
                                if (isVerified) {
                                    return (
                                        <div
                                            className="mb-4 mt-3 rounded-lg bg-green-50 p-4 text-center text-lg text-green-800"
                                            role="alert"
                                        >
                                            <strong className="font-medium">
                                                Verified!
                                            </strong>
                                        </div>
                                    );
                                }
                                if (verificationStatus == false) {
                                    return (
                                        <div
                                            className="mb-4 mt-3 rounded-lg bg-red-50 p-4 text-center text-lg text-red-800"
                                            role="alert"
                                        >
                                            <strong className="font-medium">
                                                Verification Failed!
                                            </strong>
                                        </div>
                                    );
                                }
                            })()}
                            <div className="mb-6 grid gap-6 md:grid-cols-2">
                                <div className="w-full">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-5">
                                            <label
                                                htmlFor="first_name"
                                                className="mb-2 block text-sm font-medium text-gray-900"
                                            >
                                                *First name
                                            </label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                name="first_name"
                                                onChange={handleChange}
                                                value={searchValues.first_name}
                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                htmlFor="middle_name"
                                                className="mb-2 block text-sm font-medium text-gray-900"
                                            >
                                                Middle Name
                                            </label>
                                            <input
                                                type="text"
                                                id="middle_name"
                                                name="middle_name"
                                                onChange={handleChange}
                                                value={searchValues.middle_name}
                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="mb-5 flex items-center">
                                            <input
                                                id="no_middle_name"
                                                name="no_middle_name"
                                                type="checkbox"
                                                onChange={handleChange}
                                                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                            />
                                            <label
                                                htmlFor="no_middle_name"
                                                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                            >
                                                No middle name?
                                            </label>
                                        </div>
                                        <div className="mb-5">
                                            <label
                                                htmlFor="last_name"
                                                className="mb-2 block text-sm font-medium text-gray-900"
                                            >
                                                *Last Name
                                            </label>
                                            <input
                                                type="text"
                                                id="last_name"
                                                name="last_name"
                                                onChange={handleChange}
                                                value={searchValues.last_name}
                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label
                                                htmlFor="suffix"
                                                className="mb-2 block text-sm font-medium text-gray-900"
                                            >
                                                Suffix
                                            </label>
                                            <input
                                                type="text"
                                                id="suffix"
                                                name="suffix"
                                                onChange={handleChange}
                                                value={searchValues.suffix}
                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label
                                                htmlFor="birth_date"
                                                className="mb-2 block text-sm font-medium text-gray-900"
                                            >
                                                *Birth Date
                                            </label>
                                            <input
                                                type="date"
                                                id="birth_date"
                                                name="birth_date"
                                                onChange={handleChange}
                                                value={searchValues.birth_date}
                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:w-auto"
                                            >
                                                Search
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleClear}
                                                className="me-2 ml-3 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                <div className="w-full">
                                    <div className="max-w rounded-lg border border-gray-200 bg-white p-6 shadow">
                                        {(() => {
                                            if (
                                                !isSearching &&
                                                isDoneSearching
                                            ) {
                                                if (!searchResult.first_name) {
                                                    return (
                                                        <div className="text-center">
                                                            <em>
                                                                Data not
                                                                found...
                                                            </em>
                                                        </div>
                                                    );
                                                }
                                            } else if (
                                                (!isSearching &&
                                                    !isDoneSearching) ||
                                                (!isSearching &&
                                                    isDoneSearching) ||
                                                (isSearching &&
                                                    !isDoneSearching)
                                            ) {
                                                return (
                                                    <div className="text-center">
                                                        <em>Results here...</em>
                                                    </div>
                                                );
                                            }
                                        })()}
                                        {searchResult.first_name ? (
                                            <>
                                                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                                    <table className="w-full text-left text-sm text-gray-500 rtl:text-right">
                                                        <tbody>
                                                            <tr className="border-b odd:bg-white even:bg-gray-50">
                                                                <th
                                                                    scope="row"
                                                                    className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                                                                >
                                                                    First name
                                                                </th>
                                                                <td className="px-6 py-4">
                                                                    <strong>
                                                                        {searchResult.first_name
                                                                            ? searchResult.first_name
                                                                            : ''}
                                                                    </strong>
                                                                </td>
                                                            </tr>
                                                            <tr className="border-b odd:bg-white even:bg-gray-50">
                                                                <th
                                                                    scope="row"
                                                                    className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                                                                >
                                                                    Last name
                                                                </th>
                                                                <td className="px-6 py-4">
                                                                    <strong>
                                                                        {searchResult.last_name
                                                                            ? searchResult.last_name
                                                                            : ''}
                                                                    </strong>
                                                                </td>
                                                            </tr>
                                                            <tr className="border-b odd:bg-white even:bg-gray-50">
                                                                <th
                                                                    scope="row"
                                                                    className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                                                                >
                                                                    Middle name
                                                                </th>
                                                                <td className="px-6 py-4">
                                                                    <strong>
                                                                        {searchResult.middle_name
                                                                            ? searchResult.middle_name
                                                                            : ''}
                                                                    </strong>
                                                                </td>
                                                            </tr>
                                                            <tr className="border-b odd:bg-white even:bg-gray-50">
                                                                <th
                                                                    scope="row"
                                                                    className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                                                                >
                                                                    Suffix
                                                                </th>
                                                                <td className="px-6 py-4">
                                                                    <strong>
                                                                        {searchResult.extension
                                                                            ? searchResult.extension
                                                                            : ''}
                                                                    </strong>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th
                                                                    scope="row"
                                                                    className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
                                                                >
                                                                    Birth Date
                                                                </th>
                                                                <td className="px-6 py-4">
                                                                    <strong>
                                                                        {searchResult.date_of_birth
                                                                            ? searchResult.date_of_birth
                                                                            : ''}
                                                                    </strong>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <div className="text-right">
                                                        <button
                                                            onClick={
                                                                handleOpenRBIDataModal
                                                            }
                                                            type="button"
                                                            className="mb-2 mr-2 mt-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100"
                                                        >
                                                            More details . . .
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-5">
                                                    <button
                                                        type="button"
                                                        onClick={handleVerify}
                                                        className="w-full rounded-lg bg-blue-700 px-6 py-3.5 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                                                    >
                                                        <div className="inline-flex">
                                                            Verify to National
                                                            ID{' '}
                                                            <svg
                                                                className="text-500 ml-2 h-6 w-6"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
                                                                {' '}
                                                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                                            </svg>
                                                        </div>
                                                    </button>
                                                    {(() => {
                                                        if (isVerified) {
                                                            return (
                                                                <div className="text-right">
                                                                    <button
                                                                        onClick={
                                                                            handleOpenNatIDDataModal
                                                                        }
                                                                        type="button"
                                                                        className="mb-2 mt-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100"
                                                                    >
                                                                        More
                                                                        details
                                                                        . . .
                                                                    </button>
                                                                </div>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            </>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
