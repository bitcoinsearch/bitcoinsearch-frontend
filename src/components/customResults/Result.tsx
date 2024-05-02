import React, { useCallback, useEffect, useRef, useState } from "react";
import { getResultTags } from "@/config/config-helper";
import FilterTags from "../filterTag/FilterTags";
import sanitizeHtml from "sanitize-html";
import { Parser } from "html-to-react";
import { getDomainFavicon, getMapping } from "@/config/mapping-helper";
import { getSiteName, getUrlForCombinedSummary } from "@/utils/tldr";
import { TruncateLengthInChar, TruncateLinkInChar } from "@/config/config";
import { EsSearchResult } from "@/types";
import DateIcon from "../svgs/DateIcon";
import ResultFavicon from "./ResultFavicon";
import { useTheme } from "@/context/Theme";

const htmlToReactParser = new (Parser as any)();
const { tldrLists, combinedSummaryTag } = getMapping();

type ResultProps = {
  result: EsSearchResult["_source"];
  clickThroughTags: any;
  shouldTrackClickThrough: boolean;
  trackClickThrough: () => void;
};

const Result = ({ result }: ResultProps) => {
  let dateString = null;
  const { url, title, body, domain, id } = result;

  const isTldrCombinedSummary =
    tldrLists.includes(domain) && title.includes(combinedSummaryTag);
  const mappedUrl = isTldrCombinedSummary
    ? getUrlForCombinedSummary(url, id)
    : url;

  const createdDate = result.created_at;
  if (createdDate) {
    try {
      const date = new Date(createdDate);
      const [month, day, year] = [
        date.toLocaleString("default", { month: "short" }),
        date.getDate(),
        date.getFullYear(),
      ];
      dateString = `${day} ${month}, ${year}`;
    } catch {
      dateString = null;
    }
  }

  const getBodyData = (result: ResultProps["result"]) => {
    switch (result.body_type) {
      case "markdown":
        return body;
      case "raw":
        return result?.summary ?? body;
      case "html":
        return body;
      case "combined-summary":
        return body;
      default: {
        try {
          return JSON.parse(`[${body}]`)
            .map((i) => i.text)
            .join(" ");
        } catch {
          return body || result.body_formatted;
        }
      }
    }
  };

  const sanitizedBody = sanitizeHtml(
    getBodyData(result).replaceAll("\n", "")
  ).trim();
  const truncatedUrl =
    mappedUrl.length > TruncateLinkInChar
      ? mappedUrl.substring(0, TruncateLinkInChar) + "..."
      : mappedUrl;
  const truncatedBody =
    sanitizedBody.length > TruncateLengthInChar
      ? sanitizedBody.substring(0, TruncateLengthInChar) + " ..."
      : sanitizedBody;
  const parsedBody = htmlToReactParser.parse(truncatedBody);
  const siteName = getSiteName(mappedUrl);

  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // e.stopPropagation()
    if (e.target === containerRef?.current) {
      const link = linkRef.current;
      link && link.click();
    }
  };
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      role="link"
      ref={containerRef}
      className="group/heading flex flex-col gap-2 2xl:gap-4 px-1 py-2 lg:p-5 hover:shadow-lg hover:rounded-xl max-w-full lg:max-w-2xl 2xl:max-w-4xl"
      onClick={handleCardClick}
    >
      <div className="flex gap-2 2xl:gap-4 items-center text-[8px] lg:text-xs 2xl:text-base  text-custom-secondary-text font-medium">
        <ResultFavicon
          key={siteName}
          src={getDomainFavicon(domain, isDark)}
          alt={`${siteName}-favicon`}
          domain={domain}
          isDark={isDark}
        />
        <p className="capitalize">{siteName}</p>
        <div className=" w-[2px] h-[2px] lg:w-[6px] lg:h-[6px] rounded-full text-custom-secondary-text bg-custom-black" />
        <a
          target="_blank"
          className=""
          href={mappedUrl}
          data-umami-event="URL Clicked"
          data-umami-event-src={mappedUrl}
          ref={linkRef}
        >
          {truncatedUrl}
        </a>
      </div>
      <div className="pointer-events-none flex flex-col gap-2 lg:gap-5 ">
        <h2 className="text-sm lg:text-base 2xl:text-[1.375rem] text-custom-primary-text font-semibold">
          <a
            href={mappedUrl}
            target="_blank"
            className="pointer-events-auto group-hover/heading:text-custom-accent cursor-pointer hover:underline"
          >
            {htmlToReactParser.parse(sanitizeHtml(title))}
          </a>
        </h2>
        <p className="text-sm lg:text-[0.843rem] 2xl:text-lg text-custom-secondary-text">
          {parsedBody}
        </p>
      </div>
      <div className="pointer-events-none flex justify-between gap-3 xl:gap-12 items-center">
        <div className="flex gap-2 lg:gap-16 text-base font-semibold text-custom-primary-text">
          {dateString && (
            <div className="flex w-full items-center gap-2">
              <DateIcon className="flex-shrink-0 text-custom-black dark:text-custom-secondary-text" />
              <p className="text-[8px] whitespace-nowrap lg:text-xs 2xl:text-base">
                {dateString}
              </p>
            </div>
          )}
        </div>
        <div className={`pointer-events-auto flex overflow-hidden`}>
          {getResultTags().map((field, idx) => {
            if (result[field])
              return (
                <FilterTags
                  key={`${field}_${idx}`}
                  field={field}
                  options={result[field]}
                />
              );
          })}
        </div>
      </div>
    </div>
  );
};

export default Result;
