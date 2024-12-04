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
    });
    const [searchResult, setSearchResult] = useState({});
    const [verificationResult, setVerificationResult] = useState({});
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);

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
    }

    function handleVerify(e) {
        setVerificationResult({});
        startLiveness();
    }

    function handleSubmit(e) {
        e.preventDefault();

        axios
            .post('/records', searchValues)
            .then(function (response) {
                // console.log("Response3: ", response);
                if (response.data != '') {
                    setSearchResult(response.data);
                } else {
                    setSearchResult({});
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    function startLiveness() {
        window
            .eKYC()
            .start({
                pubKey: NID_PUBLIC_API_KEY,
            })
            .then((data) => {
                // console.log(data.result.session_id)
                apiAuthenticate(data.result.session_id);
            })
            .catch((err) => {
                console.log('error', err);
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
                // console.log("RESPONSE: ", response)
                setVerificationResult(response);
            })
            .catch((err) => {
                console.log('error: ', err);
            });
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Records
                </h2>
            }
        >
            <Head title="Records" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {(() => {
                                if (verificationResult.data) {
                                    if (verificationResult.data.reference) {
                                        return (
                                            <div
                                                className="mb-4 mt-3 rounded-lg bg-green-50 p-4 text-center text-lg text-green-800 dark:bg-gray-800 dark:text-green-400"
                                                role="alert"
                                            >
                                                <strong className="font-medium">
                                                    Verified!
                                                </strong>
                                            </div>
                                        );
                                    } else if (
                                        verificationResult.data.verified ==
                                        false
                                    ) {
                                        return (
                                            <div
                                                className="mb-4 mt-3 rounded-lg bg-red-50 p-4 text-center text-lg text-red-800 dark:bg-gray-800 dark:text-red-400"
                                                role="alert"
                                            >
                                                <strong className="font-medium">
                                                    Verification Failed!
                                                </strong>
                                            </div>
                                        );
                                    }
                                }
                            })()}
                            <div className="mb-6 grid gap-6 md:grid-cols-2">
                                <div className="w-full">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-5">
                                            <label
                                                htmlFor="first_name"
                                                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                *First name
                                            </label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                name="first_name"
                                                onChange={handleChange}
                                                value={searchValues.first_name}
                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label
                                                htmlFor="middle_name"
                                                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                Middle Name
                                            </label>
                                            <input
                                                type="text"
                                                id="middle_name"
                                                name="middle_name"
                                                onChange={handleChange}
                                                value={searchValues.middle_name}
                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label
                                                htmlFor="last_name"
                                                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                *Last Name
                                            </label>
                                            <input
                                                type="text"
                                                id="last_name"
                                                name="last_name"
                                                onChange={handleChange}
                                                value={searchValues.last_name}
                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label
                                                htmlFor="suffix"
                                                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                Suffix
                                            </label>
                                            <input
                                                type="text"
                                                id="suffix"
                                                name="suffix"
                                                onChange={handleChange}
                                                value={searchValues.suffix}
                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label
                                                htmlFor="birth_date"
                                                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                *Birth Date
                                            </label>
                                            <input
                                                type="date"
                                                id="birth_date"
                                                name="birth_date"
                                                onChange={handleChange}
                                                value={searchValues.birth_date}
                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                            >
                                                Search
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleClear}
                                                className="me-2 ml-3 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                <div className="w-full">
                                    <div className="mb-2">
                                        <strong>Result:</strong>
                                    </div>
                                    {searchResult.first_name ? (
                                        <>
                                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                                <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
                                                    <tbody>
                                                        <tr className="border-b odd:bg-white even:bg-gray-50 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                                            <th
                                                                scope="row"
                                                                className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
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
                                                        <tr className="border-b odd:bg-white even:bg-gray-50 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                                            <th
                                                                scope="row"
                                                                className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
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
                                                        <tr className="border-b odd:bg-white even:bg-gray-50 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                                            <th
                                                                scope="row"
                                                                className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
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
                                                        <tr className="border-b odd:bg-white even:bg-gray-50 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                                                            <th
                                                                scope="row"
                                                                className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
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
                                                                className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
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
                                                    className="w-full rounded-lg bg-blue-700 px-6 py-3.5 text-center text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                                >
                                                    Verify
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <em>No Data</em>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
