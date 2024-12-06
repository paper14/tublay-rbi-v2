import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Records({ NID_PUBLIC_API_KEY }) {
    const [searchValues, setSearchValues] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        suffix: '',
        birth_date: '',
    });
    const [searchResult, setSearchResult] = useState({});
    const [verificationResult, setVerificationResult] = useState({});
    const [isSearching, setIsSearching] = useState(false);
    const [isDoneSearching, setIsDoneSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(true);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        // console.log("NID_PUBLIC_API_KEY: ", NID_PUBLIC_API_KEY)
    }, []);

    function handleChange(e) {
        const key = e.target.id;
        const value = e.target.value;
        setSearchValues((searchValues) => ({
            ...searchValues,
            [key]: value,
        }));
        setSearchResult({});
        setVerificationResult({});
    }

    function handleClear(e) {
        // console.log("Clear")
        setSearchValues({
            first_name: '',
            last_name: '',
            middle_name: '',
            suffix: '',
            birth_date: '',
        });
        setSearchResult({});
        setVerificationResult({});
        setIsSearching(true);
        setIsDoneSearching(false);
        setIsLoading(false);
        setIsVerified(false);
        setIsVerifying(false);
        setVerificationStatus(true);
        setOpenModal(false);
    }

    function handleVerify(e) {
        setIsVerified(false);
        setIsVerifying(true);
        setIsLoading(true);
        setVerificationResult({});
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
                setIsSearching(true)
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
                // console.log('error', err);
                setIsLoading(false);
                setIsVerifying(false)
            });
    }

    function apiAuthenticate(liveness_session_id) {
        axios
            .post('/records/api/validate', {
                first_name: searchResult.first_name,
                last_name: searchResult.last_name,
                middle_name: searchResult.middle_name,
                suffix: searchResult.extension,
                birth_date: searchResult.date_of_birth,
                face_liveness_session_id: liveness_session_id,
            })
            .then(function (response) {
                setVerificationResult(response);
                setIsLoading(false);

                if (response.data) {
                    if (response.data.reference) {
                        // console.log("response.data.reference: ", response.data.reference)
                        setOpenModal(true);
                        setIsVerifying(false);
                        setIsVerified(true);
                    } else if (
                        response.data.verified ==
                        false
                    ) {
                        setOpenModal(true);
                        setIsVerifying(false);
                        setIsVerified(false);
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
        setOpenModal(false)
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
                <div className="relative bg-white rounded-lg shadow">
                    <button type="button" onClick={handleCloseModal} className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="popup-modal">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        {(() => {
                            if(isVerified){
                                return (
                                    <>
                                        <svg className="h-24 w-24 text-green-500 mx-auto mb-5"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="3"  strokeLinecap="round"  strokeLinejoin="round">  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />  <polyline points="22 4 12 14.01 9 11.01" /></svg>
                                        <h3 className="text-lg font-normal text-gray-500">Verified!</h3>
                                    </>
                                );
                            }
                            if(verificationStatus == false){
                                return (
                                    <>
                                        <svg className="h-24 w-24 text-red-500 mx-auto mb-5"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round">  <circle cx="12" cy="12" r="10" />  <line x1="12" y1="8" x2="12" y2="12" />  <line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        <h3 className="text-lg font-normal text-gray-500">Verification Failed!</h3>
                                    </>
                                );
                            }
                        })()}
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
                                            <div className='flex justify-center items-center'>
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
                                                <div className='ml-3 text-center'>
                                                    {isVerifying ? 'Verifying...' : 'Loading...'} Plase Wait...
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
                            {/* {(() => {
                                if(isVerified){
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
                                if(verificationStatus == false){
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
                            })()} */}
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
                                        <div className="mb-5">
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
                                    <div className="max-w p-6 bg-white border border-gray-200 rounded-lg shadow">
                                        {(()=>{
                                            if(!isSearching && isDoneSearching){
                                                if(!searchResult.first_name){
                                                    return <div className='text-center'><em>Data not found...</em></div>
                                                }
                                            } else if((!isSearching && !isDoneSearching) || (!isSearching && isDoneSearching) || (isSearching && !isDoneSearching)){
                                                return <div className='text-center'><em>Results here...</em></div>
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
                                                </div>
                                                <div className="mt-5">
                                                    <button
                                                        type="button"
                                                        onClick={handleVerify}
                                                        className="w-full rounded-lg bg-blue-700 px-6 py-3.5 text-center text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                                                    >
                                                        Verify
                                                    </button>
                                                </div>
                                            </>
                                        ) : ('')}
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
