import {
  FormControl,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
} from "@chakra-ui/react";
import React, { FormEvent, useState, useTransition } from "react";
import { getFormURL } from "../../config/config-helper";
import CircleCheck from "public/circle-tick.svg";
import Image from "next/image";

const defaultFieldState = {
  value: "",
  isValid: true,
};

const urlRegex =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
const emailRegex = /^\S+@\S+\.\S+$/;

const FormModal = ({ formOpen, closeForm }) => {
  const [urlState, setUrlState] = useState({
    value: "",
    isValid: true,
  });
  const [emailState, setEmailState] = useState({
    value: "",
    isValid: true,
  });
  const [formState, setFormState] = useState({
    loading: false,
    error: "",
    success: null,
  });

  const url = getFormURL();

  const submitToSheet = async (data: FormData): Promise<any> => {
    // const response = await fetch(url, {
    //   method: "POST",
    //   body: data,
    // });
    // return response.json();
    return new Promise((res, rej) => {
      setTimeout(() => {
        res({
          result: "failed",
        });
      }, 3000);
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("URL", urlState.value);
    setFormState((prev) => ({ ...prev, loading: true }));

    submitToSheet(data)
      .then((res) => {
        if (res.result === "success") {
          setFormState({ loading: false, error: "", success: true });
        } else {
          throw Error(res.result);
        }
      })
      .catch((err) => {
        setFormState({
          loading: false,
          error: err.message ?? "Unsuccessful, Try again later",
          success: false,
        });
      });
  };

  const resetAndCloseForm = () => {
    setFormState({ loading: false, success: false, error: "" });
    setUrlState(defaultFieldState);
    setEmailState(defaultFieldState);
    closeForm();
  };

  const formIsComplete = !!(emailState.value.trim() && urlState.value.trim()) && urlState.isValid && emailState.isValid;;

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlState((prev) => ({ ...prev, value }));
    validateUrl(value);
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailState((prev) => ({ ...prev, value }));
    validateEmail(value);
  };
  const validateUrl = (url: string) => {
    const isValid = urlRegex.test(url);
    url.trim() && setUrlState((prev) => ({ ...prev, isValid }));
  };
  const validateEmail = (email: string) => {
    const isValid = emailRegex.test(email);
    email.trim() && setEmailState((prev) => ({ ...prev, isValid }));
  };

  return (
    <Modal isOpen={formOpen} onClose={resetAndCloseForm}>
      <ModalOverlay />
      <ModalContent
        mx={{ base: "16px", lg: "0px" }}
        maxW={{ base: "400px", lg: "580px" }}
        borderRadius={20}
        backgroundColor={"transparent"}
      >
        <div className="bg-custom-background p-4 lg:p-10 rounded-[20px]">
          <ModalHeader p={0} mb={{ base: "28px", lg: "42px" }}>
            <p className="text-center text-custom-primary-text font-medium mb-4 lg:mb-5 lg:text-3xl leading-none">
              Help Expand Our Source Library
            </p>
            <p className="text-center text-custom-secondary-text text-sm lg:text-lg font-normal">
              We manually review every suggestion to ensure it meets our
              standards for reliable, technical Bitcoin content.
            </p>
          </ModalHeader>
          <ModalBody p={0}>
            {formState.success ? (
              <div
                role="button"
                className="flex mt-10 py-3 justify-center gap-2 bg-[#72BF6A] rounded-lg"
                onClick={resetAndCloseForm}
              >
                <Image src={CircleCheck} alt="success icon" />
                <p className="font-bold w-fit">Submitted Successfully</p>
              </div>
            ) : formState?.error ? (
              <>
                <p className="text-red-400 font-semibold text-center mb-5">Submission Failed</p>
                <div role="button" onClick={() => setFormState({ loading: false, success: false, error: "" })} className="flex mt-10 py-3 justify-center gap-2 bg-custom-accent rounded-lg">
                  <p className="font-bold w-fit text-custom-background">Try again!</p>
                </div>
              </>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 lg:gap-8 text-custom-primary-text"
              >
                <FormControl className="flex flex-col gap-[6px] lg:gap-2">
                  <label
                    className="ml-1 text-sm lg:text-base font-semibold"
                    htmlFor="form-url"
                  >
                    Source&apos;s URL
                  </label>
                  <input
                    id="form-url"
                    type="url"
                    placeholder="https://"
                    onChange={handleUrlChange}
                    value={urlState.value}
                    required
                    maxLength={255}
                    className="bg-custom-background px-2 py-2 lg:py-[10px] border-[1px] border-custom-stroke rounded-[10px] focus:border-custom-accent focus:outline-none"
                  />
                  <div className="ml-1 text-[11px] lg:text-sm font-medium">
                    {urlState.isValid ? (
                      <p className="text-custom-secondary-text">
                        Please enter the full URL, including http:// or https://
                      </p>
                    ) : (
                      <p className="text-red-400">Invalid Url</p>
                    )}
                  </div>
                </FormControl>
                <FormControl className="flex flex-col gap-[6px] lg:gap-2">
                  <label
                    className="ml-1 text-sm lg:text-base font-semibold"
                    htmlFor="form-email"
                  >
                    Your Email
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    placeholder=""
                    onChange={handleEmailChange}
                    value={emailState.value}
                    required
                    className="bg-custom-background px-2 py-2 lg:py-[10px] border-[1px] border-custom-stroke rounded-[10px] focus:border-custom-accent focus:outline-none"
                  />
                  <div className="ml-1 text-[11px] lg:text-sm font-medium">
                    {emailState.isValid ? (
                      <p className="text-custom-secondary-text">
                        We’ll notify you once the source is approved and added
                      </p>
                    ) : (
                      <p className="text-red-400">Invalid Email</p>
                    )}
                  </div>
                </FormControl>
                <div className="flex gap-2 lg:gap-4 text-custom-primary-text">
                  <button
                    className="py-3 w-full font-bold mx-auto text-sm lg:text-base bg-custom-otherLight rounded-[10px]"
                    disabled={formState.loading}
                    type="reset"
                    onClick={resetAndCloseForm}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex justify-center items-center gap-2 py-3 w-full font-bold mx-auto text-sm text-white lg:text-base bg-custom-accent disabled:bg-custom-hover-state disabled:cursor-not-allowed disabled:text-[#CCBAA3] rounded-[10px]"
                    disabled={!formIsComplete}
                    type="submit"
                  >
                    <span>Submit Source</span>
                    {formState.loading && <Spinner size="sm" />}
                  </button>
                </div>
              </form>
            )}
          </ModalBody>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default FormModal;
