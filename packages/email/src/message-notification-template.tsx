import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  pixelBasedPreset,
} from 'react-email';
import { logoUrl } from './assets.js';

export const MessageNotificationTemplate = ({
  senderName,
  messagePreview,
  conversationUrl,
}: {
  senderName: string;
  messagePreview: string;
  conversationUrl: string;
}) => {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>Nouveau message de {senderName}</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
            <Section className="mt-8">
              <table role="presentation" align="center" cellPadding="0" cellSpacing="0" border={0}>
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: 'middle', paddingRight: 8 }}>
                      <Img src={logoUrl()} width="28" height="28" alt="" />
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <Text className="m-0 font-bold text-[22px] text-black leading-[28px]">
                        Lokko Hub
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
            <Heading className="mx-0 my-7.5 p-0 text-center font-normal text-[24px] text-black">
              Nouveau message de <strong>{senderName}</strong>
            </Heading>
            <Section className="mt-[24px] mb-[24px] rounded-lg bg-[#f9f9f9] p-[20px] border border-[#eeeeee] border-solid">
              <Text className="m-0 text-[14px] text-black leading-6 italic">
                "{messagePreview}"
              </Text>
            </Section>
            <Section className="mt-8 mb-8 text-center">
              <Link
                href={conversationUrl}
                className="rounded bg-[#d97757] px-6 py-3 text-center font-semibold text-[12px] text-white no-underline inline-block"
              >
                Répondre
              </Link>
            </Section>
            <Text className="mt-6 text-[12px] text-[#666666] leading-6">
              Tu reçois cet email parce que personne n'était en ligne pour recevoir ce message en
              temps réel.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MessageNotificationTemplate;
